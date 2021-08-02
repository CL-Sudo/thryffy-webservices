import _ from 'lodash';
import Sequelize from 'sequelize';
import moment from 'moment';
import { splitStringToArray } from '@utils';
import { SEARCH_TYPES } from '@constants';

const { Op } = Sequelize;
const staticFields = [
  'id',
  'active',
  'createdBy',
  'updatedBy',
  'deletedBy',
  'createdAt',
  'updatedAt',
  'deletedAt'
];

const parseVar = str => {
  switch (str) {
    case 'true':
      return true;
    case 'false':
      return false;
    case 'null':
      return null;
    case 'undefined':
      return undefined;
    default:
      return str;
  }
};

export const search = (Model, params, excludeFields = []) => {
  const { keyword, searchType } = params;
  const fields = splitStringToArray(params.search, ',');
  const where = { [Op.or]: [] };

  if (!_.isEmpty(fields)) {
    _.map(fields, field => {
      const isId = field.slice(-2) === 'Id' || field === 'id';
      if (
        _.toInteger(searchType) === SEARCH_TYPES.LIKE &&
        !_.includes(staticFields, field) &&
        !isId
      ) {
        where[Op.or].push({ [field]: { [Op.like]: `%${keyword}%` } });
      } else {
        where[Op.or].push({ [field]: isId ? splitStringToArray(keyword, ',') : keyword });
      }
    });
  } else {
    const exclude = ['createdAt', 'updatedAt', 'deletedAt'].concat(
      _.isEmpty(excludeFields) ? [] : excludeFields
    );
    _.forOwn(Model.rawAttributes, (value, key) => {
      if (!_.includes(exclude, key)) {
        const isId = key.slice(-2) === 'Id';
        if (
          _.toInteger(searchType) === SEARCH_TYPES.LIKE &&
          !_.includes(staticFields, key) &&
          !isId
        ) {
          where[Op.or].push({ [key]: { [Op.like]: `%${keyword}%` } });
        } else {
          where[Op.or].push({ [key]: keyword });
        }
      }
    });
  }
  return { where };
};

export const addScopesByAllFields = (Model, excludeFields = []) => {
  const exclude = ['deletedAt', ...excludeFields];
  const dateFormat = ['createdAt', 'updatedAt'];

  const deleted = { where: { deletedAt: { [Op.ne]: null } } };
  Model.addScope('deletedOnly', () => deleted);

  _.forOwn(Model.rawAttributes, (val, key) => {
    if (_.includes(exclude, key)) return;
    try {
      Model.addScope(key, params => {
        if (_.isEmpty(params)) return {};
        const { searchType, value } = params;
        if (_.includes(dateFormat, key)) {
          const start = new Date(value);
          const end = new Date(value);
          end.setHours(23, 59, 59, 999);
          return { where: { [key]: { [Op.gt]: start, [Op.lt]: end } } };
        }

        if (_.toInteger(searchType) === SEARCH_TYPES.LIKE && !_.includes(staticFields, key)) {
          return { where: { [key]: { [Op.like]: `%${parseVar(value)}%` } } };
        }
        const isId = key.slice(-2) === 'Id' || key === 'id';
        const idValue = _.isString(value) ? splitStringToArray(value, ',') : value;
        return { where: { [key]: isId ? idValue : parseVar(value) } };
      });

      Model.addScope(`!${key}`, params => {
        if (_.isEmpty(params)) return {};
        const { value } = params;
        if (_.includes(dateFormat, key)) return {};
        const result = splitStringToArray(value, ',');
        return { where: { [key]: { [Op.notIn]: result } } };
      });
    } catch (e) {} // eslint-disable-line
  });
};

export const deleted = () => ({ where: { deletedAt: { [Op.not]: null } }, forceParanoid: false });

export const filterByMonth = ({ value }) => {
  const start = moment(value, 'YYYY-MM-DD')
    .startOf('month')
    .format('YYYY-MM-DD');
  const end = moment(value, 'YYYY-MM-DD')
    .endOf('month')
    .format('YYYY-MM-DD');
  return {
    where: {
      createdAt: {
        [Op.between]: [start, end]
      }
    }
  };
};
