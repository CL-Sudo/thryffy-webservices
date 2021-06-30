import formidable from 'formidable';
import R from 'ramda';

import {
  Notifications,
  Users,
  MarketingNotifications,
  NotificationTopicUsers,
  NotificationTopics
} from '@models';

import { defaultExcludeFields } from '@constants/sequelize.constant';
import NOTIFICATION from '@constants/notification.constant';

import { createValidator } from '@validators/Admin/notifications.validator';

import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';

import { uploadFileToS3 } from '@tools/s3';

import S3_CONFIG from '@configs/s3.config';

import { parsePathForDBStoring } from '@utils/s3.util';

import { sendCloudMessage } from '@services/notification.service';

export const get = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const { id } = req.user;

    const notifications = await Notifications.findAndCountAll({
      where: { notifierId: id },
      include: [{ model: Users, as: 'actor', attributes: { exclude: [...defaultExcludeFields] } }],
      order: [['createdAt', 'DESC']],
      limit: Number(limit) || null,
      offset: Number(offset) || null
    });

    return res.status(200).json({ message: 'success', payload: notifications });
  } catch (e) {
    return next(e);
  }
};

export const create = async (req, res, next) => {
  const form = formidable({ multiple: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return next(err);
    try {
      await createValidator(req, fields, files);

      const { id } = req.user;
      const { image } = files;
      const { title, description } = fields;

      const marketingNotificationId = await sequelize.transaction(async transaction => {
        const marketingNotification = await MarketingNotifications.create(
          { ...fields, createdBy: id },
          { transaction }
        );

        if (image) {
          const uploadedFile = await uploadFileToS3(image, S3_CONFIG.NOTIFICATION_URL);
          await marketingNotification.update(
            { image: parsePathForDBStoring(uploadedFile.path) },
            { transaction }
          );
        }

        const userIds = R.pipe(
          R.filter(instance => instance.user.notificationSetting.isPromotionAllowed),
          R.map(instance => instance.userId)
        )(
          await NotificationTopicUsers.findAll({
            transaction,
            include: [
              {
                model: Users,
                as: 'user'
              },
              {
                model: NotificationTopics,
                as: 'topic',
                where: { title: NOTIFICATION.TOPIC.MARKETING }
              }
            ]
          })
        );

        const createObj = R.map(instance => ({
          title,
          description,
          notifierId: instance,
          image: marketingNotification.image,
          type: NOTIFICATION.TOPIC.MARKETING
        }))(userIds);

        await Notifications.bulkCreate(createObj, { transaction });

        return marketingNotification.id;
      });

      const payload = await MarketingNotifications.findOne({
        where: { id: marketingNotificationId }
      });

      await sendCloudMessage({
        title: fields.title,
        message: fields.description,
        topic: NOTIFICATION.TOPIC.MARKETING,
        data: {
          image: payload.image
        }
      });

      return res.status(200).json({ message: 'success', payload });
    } catch (e) {
      return next(e);
    }
  });
};

export const getUnreadNotification = async (req, res, next) => {
  try {
    const { id } = req.user;
    const unreadCount = await Notifications.count({ where: { notifierId: id, isRead: false } });
    return res.status(200).json({ message: 'success', payload: { unreadCount } });
  } catch (e) {
    return next(e);
  }
};

export const setToIsRead = async (req, res, next) => {
  try {
    const { id } = req.user;
    const notifications = await Notifications.findAll({ where: { notifierId: id, isRead: false } });
    await Promise.all(
      notifications.map(async instance => {
        await instance.update({ isRead: true });
      })
    );
    return res.status(200).json({ message: 'success' });
  } catch (e) {
    return next(e);
  }
};
