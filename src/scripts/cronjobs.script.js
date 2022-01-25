/* eslint-disable no-console */
/* eslint-disable no-new */
import { CronJob } from 'cron';
import { subscriptionRenewReminder } from '@services/subscription.service';
import { setAsDeliveredAfterShipping } from '@services/sale_orders.service';
import { remindSellerToShipParcel } from '@services/cronjob.service';

const runJobEveryMorning = () => {
  console.log(`Cronjob every day 9am...`);
  subscriptionRenewReminder();
  setAsDeliveredAfterShipping();
};

const runJobEveryTenMinutes = () => {
  console.log(`Cronjob every 10 mins...`);
  remindSellerToShipParcel();
};

new CronJob('00 09 * * *', runJobEveryMorning, null, true, null, null, true);
new CronJob('00 */30 * * * *', runJobEveryTenMinutes, null, true, null, null, true);
