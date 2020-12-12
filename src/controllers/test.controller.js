import { Users, NotificationSettings, Subscriptions } from '@models';

import R from 'ramda';

const userWithAllowedNotification = R.reject(
  instance => !instance.user.notificationSetting.isReminderAllowed
);

export const test = async (req, res, next) => {
  try {
    const subscription = await Subscriptions.findAll({
      include: [
        {
          model: Users,
          as: 'user',
          include: [
            {
              model: NotificationSettings,
              as: 'notificationSetting'
            }
          ]
        }
      ]
    });
    return res.status(404).json({
      message: 'not found',
      payload: userWithAllowedNotification(subscription)
    });
  } catch (e) {
    console.log('e', e);
    return next(e);
  }
};
