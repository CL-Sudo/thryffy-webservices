/* eslint-disable consistent-return, no-param-reassign */

import _ from 'lodash';
import R from 'ramda';
import moment from 'moment';
import numeral from 'numeral';
import mime from 'mime-types';
import async from 'async';

export const parseBoolean = param =>
  param === 'true' || param === '1' || param === 1 || param === true;

/**
 *
 * @param {Array} existingList
 * @param {Array} newList
 * @returns {Object} {intersectedItems, additionalItems, removedItems}
 */
export const listDiff = (existingList, newList) => {
  try {
    const intersectedItems = R.intersection(existingList, newList);
    const additionalItems = R.without(existingList, newList);
    const removedItems = R.difference(existingList, newList);

    return { intersectedItems, additionalItems, removedItems };
  } catch (e) {
    throw new Error(e);
  }
};

export const asyncSequentialMap = async (instances, callback) => {
  try {
    const array = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const instance of instances) {
      // eslint-disable-next-line no-await-in-loop
      const result = await callback(instance);
      array.push(result);
    }
    return Promise.resolve(array);
  } catch (e) {
    return Promise.reject(e);
  }
};

export const base64 = {
  encode: string => {
    const encoder = Buffer.from(string);
    return encoder.toString('base64');
  },

  decode: encodedString => {
    const decoder = Buffer.from(encodedString, 'base64');
    return decoder.toString();
  }
};

export const mapObjectsToArray = objects => {
  const result = [];
  R.map(obj => result.push(obj))(objects);
  return result;
};

export const paginate = (limit = 10) => (offset = 0) => list =>
  R.compose(R.take(Number(limit)), R.drop(Number(offset)))(list);

export const variable = {
  isClass: func =>
    typeof func === 'function' && /^class\s/.test(Function.prototype.toString.call(func)),
  isBoolean: v => typeof v === 'boolean'
};

export const splitStringToArray = (str, symbol) => {
  if (!str) return [];
  const result = str.split(symbol);
  result.forEach((val, index) => {
    result[index] = val.replace(/\s/g, ''); // Remove white space
  });
  return _.isEmpty(result) ? [] : result;
};

export const getErrorMessage = err => {
  if (_.has(err, 'response')) {
    const { status, statusText, config } = err.response;
    if (status === 404) {
      return `${status} ${statusText}: ${config.url}`;
    }

    if (_.has(err.response, 'data')) {
      if (err.response.data) return err.response.data;
    }
  }

  if (err.message) return err.message;

  if (_.has(err, 'message')) {
    if (_.has(err, 'parent')) {
      if (_.has(err.parent, 'sqlMessage')) {
        return err.parent.sqlMessage;
      }
      return err.parent;
    }
    return err.message;
  }
  let errorMessage = err;
  if (_.isArray(errorMessage)) {
    errorMessage = _.join(errorMessage, '\n');
  } else if (!_.isString(errorMessage)) {
    errorMessage = JSON.stringify(errorMessage);
  }
  return errorMessage;
};

// export const paginate = ({ data, limit = 10, offset = 0 }) => _.drop(data, offset || 0).slice(0, limit || 10);

export const decimalToPercentage = value => parseFloat((value * 100).toFixed(2));

export const percentageToDecimal = value => {
  if (value < 1 && value > 0) return value;
  return value / 100;
};

// eslint-disable-next-line no-restricted-globals
export const isValidDate = d => d instanceof Date && !isNaN(d);

export const parseDate = d => moment(d, 'YYYY-MM-DD').format('DD/MM/YYYY');

export const getDateWithoutTime = d => moment.utc(d).format('YYYY-MM-DD');

export const parseMoney = value => numeral(value).format('0,0.00');

export const getPeriodFromTransactionMonths = transactionMonths => {
  let result = '';
  let count = 0;

  const data = [];
  _.map(transactionMonths, obj => {
    const date = moment(obj.period || obj.createdAt, 'YYYY-MM-DD');
    data.push({ year: date.format('YYYY'), month: date.format('MMM') });
  });

  const grouped = _.groupBy(data, 'year');
  const formated = [];
  _.mapValues(grouped, val => formated.push(val));
  _.map(formated, (val, key) => {
    let months = '';
    let year;
    _.map(val, (date, key1) => {
      // eslint-disable-next-line prefer-destructuring
      year = date.year;
      if (key1 > 0) months += '-';
      months += date.month;
    });
    if (key > 0) result += ', ';
    result += `${months}-${year}`;
    count += 1;
  });

  return { result, count };
};

export const getPermissionsFromAccessLevel = accessLevel => {
  if (_.isEmpty(accessLevel)) return [];
  const { permissions } = accessLevel;
  if (_.isEmpty(permissions)) return [];
  return _.map(permissions, p => p.action);
};

export const booleanToString = (bool, [yes, no]) =>
  bool === true || bool === 'true' || bool === 1 || bool === '1' ? yes : no;

export const getQuarterlyMonths = (month, year, { force = false } = {}) => {
  if (month instanceof Date) month = month.getMonth() + 1;
  if (year instanceof Date) year = year.getFullYear();

  let months = [];
  if (month <= 3 && month >= 1) months = [1, 2, 3];
  if (month <= 6 && month >= 4) months = [4, 5, 6];
  if (month <= 9 && month >= 7) months = [7, 8, 9];
  if (month <= 12 && month >= 9) months = [10, 11, 12];

  const dates = [];
  // eslint-disable-next-line array-callback-return
  months.map(m => {
    if (force) {
      if (m >= month) dates.push(new Date(`${year}-${m}`));
    } else {
      dates.push(new Date(`${year}-${m}`));
    }
  });
  return dates;
};

/* eslint-disable */
export const currencyToWords = function(totalRent) {
  var a = [
    '',
    'one ',
    'two ',
    'three ',
    'four ',
    'five ',
    'six ',
    'seven ',
    'eight ',
    'nine ',
    'ten ',
    'eleven ',
    'twelve ',
    'thirteen ',
    'fourteen ',
    'fifteen ',
    'sixteen ',
    'seventeen ',
    'eighteen ',
    'nineteen '
  ];
  var b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  var number = parseFloat(totalRent)
    .toFixed(2)
    .split('.');
  var num = parseInt(number[0]);
  var digit = parseInt(number[1]);
  if (num.toString().length > 9) return 'overflow';
  var n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  var d = ('00' + digit).substr(-2).match(/^(\d{2})$/);
  if (!n) return;
  var str = '';
  str += n[1] != 0 ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
  str += n[2] != 0 ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
  str += n[3] != 0 ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
  str += n[4] != 0 ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
  str += n[5] != 0 ? (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'ringgit ' : '';
  str +=
    d[1] != 0
      ? (str != '' ? 'and ' : '') + (a[Number(d[1])] || b[d[1][0]] + ' ' + a[d[1][1]]) + 'cent only'
      : 'only';
  return str;
};
/* eslint-enable */

export const downloadStream = (res, stream, filename) => {
  res.header('Content-Disposition', `attachment; filename="${filename}"`);
  stream.pipe(res);
};

export const getExtensionFromString = val => {
  const re = /(?:\.([^.]+))?$/;
  return re.exec(val)[1];
};

export const setFileResHeader = (res, filename, ext) => {
  const extension = ext || getExtensionFromString(filename);
  const contentType = mime.lookup(extension);
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
};

export const randomInArray = ary => ary[Math.floor(Math.random() * ary.length)];

export const monthDiff = (dateFrom, dateTo) =>
  dateTo.getMonth() - dateFrom.getMonth() + 12 * (dateTo.getFullYear() - dateFrom.getFullYear());

export const isJson = (val, getJsonValue = false) => {
  try {
    const data = JSON.parse(val);
    if (getJsonValue) return data;
  } catch (e) {
    return false;
  }
  return true;
};

export const extractEmailAddr = email => {
  const nameReplace = email.replace(/@.*$/, '');
  const name = nameReplace !== email ? nameReplace : null;
  return name;
};

export const getLabelFromConstant = (constant, value) => {
  const label = _.get(
    _.find(constant, o => o.value === value),
    'label'
  );
  return label;
};

export const getConstantNameByValue = (constant, value, { object = false } = {}) => {
  const key = _.findKey(constant, o => _.get(o, 'value', o) === value);
  if (object) return constant[key];
  if (_.has(constant[key], 'name')) return constant[key].name;
  return _.startCase(_.toLower(key));
};

export const isDate = s => {
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(s) && !isNaN(Date.parse(s))) return true;
  return false;
};

export const utcToTimezone = (
  date,
  {
    fromFormat = 'YYYY-MM-DD HH:mm:ss',
    toFormat = 'YYYY-MM-DD HH:mm:ss',
    timezone = 'Asia/Kuala_Lumpur'
  } = {}
) => {
  if (!date) return date;
  const d = moment.utc(date, fromFormat);
  return d.tz(timezone).format(toFormat);
};

export const isSuffixEmail = email => {
  const extracted = extractEmailAddr(email);
  const regex = /(?<=[+])[^\]]+/;
  const t = regex.exec(extracted);
  if (t === null) return false;
  const toNum = _.toNumber(t[0]);
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(toNum)) return false;
  if (_.isNumber(toNum)) return true;
  return false;
};

export const toUtc = (
  date,
  { startOf, endOf, toFormat = 'YYYY-MM-DD HH:mm:ss', fromFormat = 'YYYY-MM-DD HH:mm:ss' } = {}
) => {
  let d;
  if (startOf) {
    d = moment.tz(date, fromFormat, 'Asia/Kuala_Lumpur').startOf(startOf);
  } else if (endOf) {
    d = moment.tz(date, fromFormat, 'Asia/Kuala_Lumpur').endOf(endOf);
  } else {
    d = moment.tz(date, fromFormat, 'Asia/Kuala_Lumpur');
  }
  return d.utc().format(toFormat);
};

export const filterFunc = val =>
  // eslint-disable-next-line consistent-return
  _.filter(val, v => {
    if (!_.isFunction(v)) return v;
  });

export const constantToArray = con => _.map(filterFunc(con));

export const constantToValueArray = con =>
  _.filter(
    _.map(
      con,
      v => _.get(v, 'value'),
      v => v === undefined
    )
  );

export const numberToArray = num => {
  const ary = [];
  for (let i = 1; i <= num; i++) {
    ary.push(i);
  }
  return ary;
};

export const getDateDuration = (start, end) => {
  start = moment(start); // eslint-disable-line no-param-reassign
  end = moment(end); // eslint-disable-line no-param-reassign
  const duration = moment.duration(end.diff(start));

  const result = {
    duration,
    seconds: Math.trunc(duration.as('seconds')),
    minutes: Math.trunc(duration.as('minutes')),
    hours: Math.trunc(duration.as('hours')),
    days: Math.trunc(duration.as('days')),
    weeks: Math.trunc(duration.as('weeks')),
    months: Math.trunc(duration.as('months')),
    years: Math.trunc(duration.as('years'))
  };
  return result;
};

export const asyncCargo = size =>
  async.cargo(async (tasks, callback) => {
    await Promise.all(
      _.map(tasks, async task => {
        if (task) await task();
      })
    );
    callback();
  }, size);
