import { Op } from 'sequelize';
import _ from 'lodash';
import R from 'ramda';

export const dateRangeQuery = (dataIndex, { fromIndex = 'from', toIndex = 'to' } = {}) => value => {
  const from = _.get(value, fromIndex, null);
  const to = _.get(value, toIndex, null);

  const andQuery = [];
  if (from) {
    const d = new Date(from);
    d.setDate(2);
    andQuery.push({ [dataIndex]: { [Op.gte]: d } });
  }

  if (to) {
    const date = new Date(to);
    const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    d.setDate(d.getDate() + 1);
    andQuery.push({ [dataIndex]: { [Op.lte]: d } });
  }

  if (_.isEmpty(andQuery)) return {};
  return { [Op.and]: andQuery };
};

export const parseKeywordForBooleanMode = keyword => {
  const insertWhiteSpace = param => ` ${param}`;
  const result = R.pipe(
    R.trim,
    insertWhiteSpace,
    R.replace(/  +/g, ' '),
    R.replace(/ /g, '+')
  )(keyword);
  return result;
};

export const parseKeywordForNLP = keyword => {
  const result = R.pipe(R.trim, R.replace(/  +/g, ' '), R.replace(/ /g, ','))(keyword);
  return result;
};
