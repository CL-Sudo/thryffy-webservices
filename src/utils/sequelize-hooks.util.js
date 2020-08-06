/* eslint-disable no-param-reassign */
import _ from 'lodash';
import { Op } from 'sequelize';
import { modelAssociationsObject } from '@utils/model.util';
import { variable, utcToTimezone } from '@utils';
import { isDev } from '@configs';

const rq = (param, func) => {
  throw new Error(`Error in hooks.helper[${func}]: '${param}' is required`);
};

export const validateUniqueField = (Model, { field, value, exclude = [], where = null, customMessage } = {}) =>
  new Promise(async (resolve, reject) => {
    try {
      if (!where) {
        if (!field) rq('field', 'validateUniqueField');
        // if (!value) required('value', 'validateUniqueField');
        // if (!value) return resolve();
      }

      if (!value && !where) return resolve();
      const result = await Model.count({
        where: where
          ? { ...where, id: { [Op.notIn]: exclude } }
          : {
              [field]: value,
              id: { [Op.notIn]: exclude }
            }
      });
      if (result > 0) {
        return reject(new Error(customMessage || `${_.upperFirst(field || Model.name)} already exists`));
      }
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });

export const validateRequiredFields = (obj, fields) =>
  new Promise((resolve, reject) => {
    let pass = true;
    const errorFields = [];

    _.map(fields, field => {
      if (!_.has(obj.dataValues, field)) {
        pass = false;
        errorFields.push(field);
      }
    });

    if (pass === false) return reject(new Error(`${_.toString(errorFields)} is required`));
    return resolve();
  });

export const getChangesAfterUpdate = obj => {
  const { _changed } = obj;
  const excludes = ['updatedAt'];

  const changes = {};
  _.mapKeys(_.omit(_changed, excludes), (value, key) => {
    changes[key] = obj[key];
  });
  return changes;
};

export const excludeHiddenFields = (query, fields = []) => {
  const { attributes, showHidden } = query;
  // if (!showHidden) {
  if (_.isArray(attributes)) {
    if (showHidden) {
      query.attributes = _.concat(query.attributes, fields);
    } else {
      _.remove(attributes, attr => _.includes(fields, attr));
    }
  } else if (_.isObject(attributes)) {
    if (showHidden) {
      attributes.exclude = _.remove(attributes.include, attr => _.includes(fields, attr));
      attributes.include = [...attributes.exclude, ...fields];
    } else {
      attributes.include = _.remove(attributes.include, attr => _.includes(fields, attr));
      attributes.exclude = [...attributes.exclude, ...fields];
    }
  } else if (_.isEmpty(attributes)) {
    if (showHidden) {
      query.attributes = fields;
    } else {
      query.attributes = { exclude: fields };
    }
  }
  // }
};

export const parseParanoidToIncludes = query => {
  if (variable.isBoolean(query.forceParanoid)) {
    query.paranoid = query.forceParanoid;
    return;
  }

  const setParanoid = (include, paranoid) => {
    if (_.isArray(include)) {
      _.map(include, obj => {
        obj.paranoid = paranoid;
        if (_.has(obj, 'include')) setParanoid(obj.include, obj.paranoid);
      });
    } else {
      include.paranoid = paranoid;
    }
  };

  if (_.has(query, 'paranoid')) {
    if (_.has(query, 'include')) setParanoid(query.include, query.paranoid);
  }
};

export const requiredInclude = (Model, query, { includes = [], exclude = [], required = [], force = false } = {}) => {
  let all = false;

  if (_.isEmpty(query.include)) {
    query.include = includes;
  } else if (_.isArray(query.include) && query.include.length === 1 && _.isEqual(query.include[0], { all: true })) {
    if (_.isEmpty(exclude) && !force) return;
    all = true;
    query.include = includes;
  } else if (_.isArray(query.include)) {
    const toInclude = [];
    _.map(includes, i => {
      if (!force) {
        if (!_.find(query.include, o => o.as === i.as)) {
          toInclude.push(i);
        }
      } else {
        _.remove(query.include, o => o.as === i.as);
        toInclude.push(i);
      }
    });
    query.include = [...toInclude, ...query.include];
  }

  if (all) {
    const associations = modelAssociationsObject(Model);
    _.forOwn(associations, (model, key) => {
      const associate = {
        model,
        as: key,
        required: _.includes(required, key)
      };
      if (!_.includes(exclude, key)) {
        if (!_.find(includes, o => o.as === key)) {
          query.include.push(associate);
        }
      }
    });
  }
};

export const compareChanges = (record, { excludes = ['updatedAt'] } = {}) => {
  const changes = {};
  const { dataValues, _previousDataValues } = record;
  _.mapKeys(_previousDataValues, (value, key) => {
    if (_.includes(excludes, key)) return;
    let newValue = _.get(dataValues, key, undefined);
    if (newValue === undefined) return;

    const isId = _.isNumber(value);
    if (isId && newValue !== null) newValue = _.toNumber(newValue);

    const equal = _.isEqual(newValue, value);
    if (!equal) changes[key] = { before: value, after: newValue };
  });
  return changes;
};

export const parseDateTimeToClientTimezone = (data, { timezone, raw } = {}) => {
  if (isDev) return;
  if (_.isArray(data)) {
    _.map(data, row => {
      _.mapKeys(raw ? row : row.dataValues, (val, key) => {
        if (_.isDate(val)) {
          if (raw) {
            row[key] = utcToTimezone(val, { timezone });
          } else {
            row.setDataValue(key, utcToTimezone(val, { timezone }));
          }
        } else {
          parseDateTimeToClientTimezone(val, { timezone, raw });
        }
      });
    });
  } else if (_.isObject(data)) {
    _.mapKeys(raw ? data : data.dataValues, (val, key) => {
      if (_.isDate(val)) {
        if (raw) {
          data[key] = utcToTimezone(val, { timezone });
        } else {
          data.setDataValue(key, utcToTimezone(val, { timezone }));
        }
      } else {
        parseDateTimeToClientTimezone(val, { timezone, raw });
      }
    });
  }
};
