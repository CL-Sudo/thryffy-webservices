import formidable from 'formidable';
import R from 'ramda';

import { Notifications, Users, MarketingNotifications, NotificationSettings } from '@models';

import { defaultExcludeFields } from '@constants/sequelize.constant';
import NOTIFICATION from '@constants/notification.constant';

import { createValidator } from '@validators/Admin/notifications.validator';

import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';

import { uploadFileToS3 } from '@tools/s3';

import S3_CONFIG from '@configs/s3.config';

import { parsePathForDBStoring } from '@utils/s3.util';

import { sendCloudMessage } from '@services/notification.service';
import { Op } from 'sequelize';

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
      const deviceTokens = [];
      const operations = [];

      const marketingNotificationId = await sequelize.transaction(async transaction => {
        const marketingNotification = await MarketingNotifications.create(
          { ...fields, createdBy: id, countryId: req.user.countryId },
          { transaction }
        );

        if (image) {
          const uploadedFile = await uploadFileToS3(image, S3_CONFIG.NOTIFICATION_URL);
          await marketingNotification.update(
            { image: parsePathForDBStoring(uploadedFile.path) },
            { transaction }
          );
        }

        const users = await Users.scope([{ method: ['byCountry', req.user.countryId] }]).findAll({
          attributes: ['id', 'deviceToken'],
          include: [
            {
              model: NotificationSettings,
              as: 'notificationSetting',
              where: { isPromotionAllowed: true }
            }
          ],
          where: {
            deviceToken: {
              [Op.ne]: null
            }
          },
          transaction
        });

        const createObj = R.map(instance => {
          deviceTokens.push(instance.deviceToken);
          return {
            title,
            description,
            notifierId: instance.id,
            image: marketingNotification.image,
            type: NOTIFICATION.TOPIC.MARKETING
          };
        })(users);

        await Notifications.bulkCreate(createObj, { transaction });

        return marketingNotification.id;
      });

      const payload = await MarketingNotifications.findOne({
        where: { id: marketingNotificationId }
      });

      deviceTokens.forEach(token => {
        operations.push(
          sendCloudMessage({
            title: fields.title,
            message: fields.description,
            token,
            data: {
              image: payload.image
            }
          })
        );
      });

      await Promise.all(operations);

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
