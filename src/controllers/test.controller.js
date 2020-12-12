import { Users, Subscriptions } from '@models';

import { subscriptionRenewReminder } from '@services/subscription.service';

import moment from 'moment';

export const test = async (req, res, next) => {
  try {
    await subscriptionRenewReminder();
    return res.status(404).json({
      message: 'not found'
    });
  } catch (e) {
    console.log('e', e);
    return next(e);
  }
};
