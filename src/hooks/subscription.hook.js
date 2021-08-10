import { Subscriptions } from '@models';
import moment from 'moment';

/**
 *
 * @param {Number} packageId packageId to be subscribed
 * @param {Number} userId subscriber userId
 */
const decideExpiryDate = async (packageId, userId) => {
  try {
    const sub = await Subscriptions.findOne({
      where: { userId }
    });

    const subExpiryDate = moment(sub.expiryDate);
    const now = moment();
    const diff = now.diff(subExpiryDate, 'days');

    switch (true) {
      case packageId === sub.packageId && diff <= 0: {
        const exp = moment(subExpiryDate)
          .add(30, 'days')
          .format('YYYY-MM-DD HH:mm:ss');

        return Promise.resolve(exp);
      }

      case packageId === sub.packageId && diff > 0: {
        const exp = moment()
          .add(30, 'days')
          .format('YYYY-MM-DD HH:mm:ss');
        return Promise.resolve(exp);
      }

      case packageId !== sub.packageId: {
        const exp = moment()
          .add(30, 'days')
          .format('YYYY-MM-DD HH:mm:ss');
        return Promise.resolve(exp);
      }

      default:
        throw new Error('Oops, something is wrong!');
    }
  } catch (e) {
    return Promise.reject(e);
  }
};

Subscriptions.addHook('afterCreate', 'updateExpiryDate', async subscription => {
  try {
    await Subscriptions.update(
      {
        expiryDate: moment()
          .add(1, 'months')
          .format('YYYY-MM-DD HH:mm:ss')
      },
      { where: { id: subscription.id }, hooks: false }
    );
  } catch (e) {
    throw e;
  }
});

Subscriptions.addHook('afterUpdate', async subscription => {
  try {
    const { packageId, userId } = subscription;
    const expiryDate = await decideExpiryDate(packageId, userId);
    await Subscriptions.update(
      {
        expiryDate
      },
      { where: { id: subscription.id }, hooks: false }
    );
  } catch (e) {
    throw e;
  }
});
