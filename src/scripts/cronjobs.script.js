/* eslint-disable no-new */
import { CronJob } from 'cron';
import { subscriptionRenewReminder } from '@services/subscription.service';
import { setAsDeliveredAfterShipping } from '@services/sale_orders.service';
import { remindSellerToShipParcel } from '@services/cronjob.service';

const runJobEveryMorning = () => {
  subscriptionRenewReminder();
  setAsDeliveredAfterShipping();
};

const runJobEveryTenMinutes = () => {
  remindSellerToShipParcel();
};

new CronJob('00 09 * * *', runJobEveryMorning, null, true, null, null, true);
new CronJob('00 */10 * * * *', runJobEveryTenMinutes, null, true, null, null, true);
