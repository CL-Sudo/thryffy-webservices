import formidable from 'formidable';

import { Notifications, Users, MarketingNotifications } from '@models';

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

      const notificationId = await sequelize.transaction(async transaction => {
        const notification = await MarketingNotifications.create(
          { ...fields, createdBy: id },
          { transaction }
        );
        if (image) {
          const uploadedFile = await uploadFileToS3(image, S3_CONFIG.NOTIFICATION_URL);
          await notification.update(
            { image: parsePathForDBStoring(uploadedFile.path) },
            { transaction }
          );
        }

        return notification.id;
      });

      const payload = await Notifications.findOne({ where: { id: notificationId } });

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
