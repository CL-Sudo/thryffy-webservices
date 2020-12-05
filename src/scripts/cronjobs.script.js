/* eslint-disable no-new */
import { CronJob } from 'cron';
import { subscriptionRenewReminder } from '@services/subscription.service';

const runJobEveryMinute = () => {
  subscriptionRenewReminder();
};

new CronJob('* * * * *', runJobEveryMinute, null, true, null, null, true);
