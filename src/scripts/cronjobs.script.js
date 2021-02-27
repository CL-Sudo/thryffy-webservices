/* eslint-disable no-new */
import { CronJob } from 'cron';
import { subscriptionRenewReminder } from '@services/subscription.service';
// import { setAsDeliveredAfterShipping } from '@services/sale_orders.service';

const runJobEveryMorning = () => {
  subscriptionRenewReminder();
  // setAsDeliveredAfterShipping();
};

new CronJob('00 09 * * *', runJobEveryMorning, null, true, null, null, true);
