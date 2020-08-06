/* eslint-disable no-use-before-define */
import _ from 'lodash';
import schedule from 'node-schedule';

export const getJobInfo = (jobId, { required = false } = {}) => {
  try {
    const job = schedule.scheduledJobs[jobId];
    if (!job && required) throw new Error(`Job ${jobId} does not exists`);
    return job;
  } catch (e) {
    throw e;
  }
};

export const createScheduleJob = (jobId, rule, callback, { force = false } = {}) => {
  try {
    const scheduledJob = getJobInfo(jobId);
    if (scheduledJob) {
      if (!force) throw new Error(`Job with jobId: ${jobId} already exists`);
      scheduledJob.cancel();
    }

    const job = schedule.scheduleJob(_.toString(jobId), rule, fireDate => {
      if (callback) callback(fireDate);
    });
    if (!job) throw new Error(`Create job failed. jobId: ${jobId}`);
    return job;
  } catch (e) {
    throw e;
  }
};

export const cancelScheduledJob = jobId => {
  try {
    const scheduledJob = getJobInfo(jobId, { required: true });
    const result = scheduledJob.cancel();
    if (!result) throw new Error(`Failed to cancel job. jobId: ${jobId}`);
    return true;
  } catch (e) {
    throw e;
  }
};

export const updateScheduledJob = (jobId, rule, callback) => {
  try {
    const jobTriggeredCount = getJobTriggeredCount(jobId);
    cancelScheduledJob(jobId);

    const updatedJob = createScheduleJob(jobId, rule, callback);
    updatedJob.setTriggeredJobs(jobTriggeredCount);
    return updatedJob;
  } catch (e) {
    throw e;
  }
};

export const getJobTriggeredCount = jobId => {
  try {
    const job = getJobInfo(jobId, { required: true });
    return job.triggeredJobs();
  } catch (e) {
    throw e;
  }
};

// Return moment date
export const getJobNextTriggerTime = jobId => {
  try {
    const job = getJobInfo(jobId, { required: true });
    // eslint-disable-next-line no-underscore-dangle
    return job.nextInvocation()._date;
  } catch (e) {
    throw e;
  }
};

export const timeValidator = (key, value, from, to, isCron = true) => {
  if (isCron && value === '*') return;
  if (!_.isNumber(value)) throw new Error(`Validation Error: '${key}' must be integer`);
  if (!_.isNumber(from)) throw new Error(`Validation Error: 'from' must be integer`);
  if (!_.isNumber(to)) throw new Error(`Validation Error: 'to' must be integer`);
  if (!_.inRange(value, from, to + 1)) throw new Error(`Validation Error: '${key}' must in (${from}-${to})`);
};

export const generateCronString = ({ minute, hour = '*', date = '*', month = '*', dayOfWeek = '*' } = {}) => {
  try {
    timeValidator('minute', minute, 0, 59);
    timeValidator('hour', hour, 0, 23);
    timeValidator('date', date, 1, 31);
    timeValidator('month', month, 1, 12);
    timeValidator('dayOfWeek', dayOfWeek, 0, 7);
    return `${minute} ${hour} ${date} ${month} ${dayOfWeek}`;
  } catch (e) {
    throw e;
  }
};

const timeValidation = {
  minute: [0, 59],
  hour: [0, 23],
  date: [1, 31],
  month: [1, 12],
  dayOfWeek: [0, 7]
};

export class CustomRule {
  constructor(props, exclude) {
    let keys = ['minute', 'hour', 'date', 'month', 'dayOfWeek'];
    keys = _.differenceWith(keys, exclude, _.isEqual);

    _.map(keys, key => {
      if (!_.has(props, key)) throw new Error(`'${key}' is required`);
      const vCon = timeValidation[key];
      timeValidator(key, props[key], vCon[0], vCon[1], false);
      this[key] = props[key];
    });
  }

  toJson() {
    return JSON.stringify(this);
  }
}
