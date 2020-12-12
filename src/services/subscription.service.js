import R from 'ramda';
import moment from 'moment';

import { Subscriptions, Users, Notifications } from '@models';

import { SUBSCRIPTION_REMINDER } from '@templates/notification.template';

import { sendCloudMessage } from '@services/notification.service';

import NOTIFICATION_CONSTANT from '@constants/notification.constant';

export const subscriptionRenewReminder = () =>
  new Promise(async (resolve, reject) => {
    try {
      console.log('cronjob running...');
      const zeroCount = await Subscriptions.findAll({
        where: {
          reminderCount: 0
        },
        include: [{ model: Users, as: 'user' }]
      });
      const oneCount = await Subscriptions.findAll({
        where: {
          reminderCount: 1
        },
        include: [{ model: Users, as: 'user' }]
      });
      const twoCount = await Subscriptions.findAll({
        where: {
          reminderCount: 2
        },
        include: [{ model: Users, as: 'user' }]
      });

      const sevenDayReminder = R.filter(sub => {
        const a = moment(sub.expiryDate);
        const b = moment();
        const diff = a.diff(b, 'days');
        return diff === 7;
      })(zeroCount);

      const threeDayReminder = R.filter(sub => {
        const a = moment(sub.expiryDate);
        const b = moment();
        const diff = a.diff(b, 'days');
        return diff === 3;
      })(oneCount);

      const expiryReminder = R.filter(sub => {
        const a = moment(sub.expiryDate);
        const b = moment();
        const diff = a.diff(b, 'days');
        return diff < 0;
      })(twoCount);

      await Promise.all(
        sevenDayReminder.map(async data => {
          const title = SUBSCRIPTION_REMINDER.DAYS_BEFORE(
            moment(data.expiryDate).format('DD/MM/YYYY')
          );
          await sendCloudMessage({
            token: data.user.deviceToken,
            title
          });
          await Notifications.create({
            title,
            notifierId: data.user.id,
            type: NOTIFICATION_CONSTANT.SUBSCRIPTION_EXPIRY_REMINDER
          });
          await data.increment('reminderCount');
        })
      );

      await Promise.all(
        threeDayReminder.map(async data => {
          const title = SUBSCRIPTION_REMINDER.DAYS_BEFORE(
            moment(data.expiryDate).format('DD/MM/YYYY')
          );
          await sendCloudMessage({
            token: data.user.deviceToken,
            title
          });
          await Notifications.create({
            title,
            notifierId: data.user.id,
            type: NOTIFICATION_CONSTANT.SUBSCRIPTION_EXPIRY_REMINDER
          });
          await data.increment('reminderCount');
        })
      );

      await Promise.all(
        expiryReminder.map(async data => {
          await sendCloudMessage({
            token: data.user.deviceToken,
            title: SUBSCRIPTION_REMINDER.EXPIRED
          });
          await Notifications.create({
            title: SUBSCRIPTION_REMINDER.EXPIRED,
            notifierId: data.user.id,
            type: NOTIFICATION_CONSTANT.SUBSCRIPTION_EXPIRY_REMINDER
          });

          await data.increment('reminderCount');

          const subscription = await Subscriptions.findOne({
            where: { userId: data.user.id },
            include: [{ model: Users, as: 'user' }]
          });

          const hasValidSubscription = await subscription.checkHasValidSubscription();
          await subscription.user.update({ hasValidSubscription });
        })
      );

      return resolve();
    } catch (e) {
      return reject(e);
    }
  });
