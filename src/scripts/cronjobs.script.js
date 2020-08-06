// /* eslint-disable no-new */
// import { CronJob } from 'cron';
// import { remindCardOnDue } from '@services/cards.services';
// import { remindReceivableOnDue } from '@services/receivable-reminders.service';

// const runJobEveryMinute = () => {
//   remindCardOnDue();
// };

// const runJobEveryDay = () => {
//   remindReceivableOnDue();
// };

// new CronJob('* * * * *', runJobEveryMinute, null, true, null, null, true);
// new CronJob('0 0 * * *', runJobEveryDay, null, true, null, null, true);
