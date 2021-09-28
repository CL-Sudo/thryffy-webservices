import { Countries, NotificationSettings, Users } from '@models';

import { generateTopicName, unsubscribeTokensFromTopic } from '@services/notification.service';

import NOTIFICATION_CONSTANT from '@constants/notification.constant';

export const getOne = async (req, res, next) => {
  try {
    const { id } = req.user;
    const payload = await NotificationSettings.findOne({ where: { userId: id } });
    return res.status(200).json({
      message: 'success',
      payload
    });
  } catch (e) {
    return next(e);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.user;

    const notificationSetting = await NotificationSettings.findOne({
      where: { userId: id },
      include: [{ model: Users, as: 'user', include: [{ model: Countries, as: 'country' }] }]
    });

    await notificationSetting.update({ ...req.body });
    await notificationSetting.reload();

    if (!req.body.isPromotionAllowed) {
      await unsubscribeTokensFromTopic(
        notificationSetting.user.deviceToken,
        generateTopicName(NOTIFICATION_CONSTANT.MARKETING, notificationSetting.user.country.name)
      );
    }

    delete notificationSetting.user;
    delete notificationSetting.dataValues.user;

    return res.status(200).json({ message: 'success', payload: notificationSetting });
  } catch (e) {
    return next(e);
  }
};
