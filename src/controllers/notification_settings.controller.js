import { NotificationSettings, Users } from '@models';

import { unsubscribeTokensFromTopic } from '@services/notification.service';

import NOTIFICATION_TYPE from '@constants/notification.constant';

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
      include: [{ model: Users, as: 'user' }]
    });

    await notificationSetting.update({ ...req.body });
    await notificationSetting.reload();

    if (!req.body.isPromotionAllowed) {
      await unsubscribeTokensFromTopic(
        notificationSetting.user.deviceToken,
        NOTIFICATION_TYPE.MARKETING
      );
    }

    delete notificationSetting.user;
    delete notificationSetting.dataValues.user;

    return res.status(200).json({ message: 'success', payload: notificationSetting });
  } catch (e) {
    return next(e);
  }
};
