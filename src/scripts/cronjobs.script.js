/* eslint-disable no-new */
import { CronJob } from 'cron';
import { subscriptionRenewReminder } from '@services/subscription.service';

const runJobEveryMorning = () => {
  subscriptionRenewReminder();
};

new CronJob('00 09 * * *', runJobEveryMorning, null, true, null, null, true);
