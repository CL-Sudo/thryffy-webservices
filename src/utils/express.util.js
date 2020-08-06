/* eslint-disable no-param-reassign */
import _ from 'lodash';
import { modelAssociationsObject } from '@utils/model.util';
import { SEARCH_TYPES } from '@constants';
import { splitStringToArray } from '@utils';

const rq = params => {
  throw new Error(`[express.util.js] Error: ${params} is required`);
};

const getRequired = (req, { prefix = '', defaultValue } = {}) => {
  if (_.isEmpty(req)) return defaultValue;
  const required = _.get(req, `query['${prefix}${prefix ? '.' : ''}required']`);
  if (required === 'true' || required === true) return true;
  if (required === 'false' || required === false) return false;
  return defaultValue;
};

const getReqAttributes = (req, { valueKey = 'attributes' } = {}) => {
  if (_.isEmpty(req)) return { exclude: 'password' };
  const attributes = _.get(req, `query[${valueKey}]`);
  if (!attributes) return { exclude: 'password' };

  const result = attributes.split(',');
  result.forEach((val, index) => {
    result[index] = val.replace(/\s/g, '');
  });
  _.remove(result, val => val === 'password');
  return _.isEmpty(result) ? { exclude: 'password' } : result;
};

const getChildInclude = (model, as, extraData = {}) => req => {
  const childInclude = [];
  const childAssociations = modelAssociationsObject(model);
  const childIncludes = _.get(req, `query['${as}.include']`, '').split(',');
  const all = _.get(childIncludes, '[0]') === 'all';

  if (all) {
    _.forOwn(childAssociations, (m, key) => {
      const scopes = getScopes(model, { prefix: `${as}.${key}` })(req);
      childInclude.push({
        ...extraData,
        model: _.isEmpty(scopes) ? m : m.scope(scopes),
        as: key,
        attributes: getReqAttributes(req, { valueKey: `'${as}.${key}.attributes'` }),
        include: getChildInclude(m, `${as}.${key}`)(req),
        required: getRequired(req, { prefix: `${as}.${key}`, defaultValue: !_.isEmpty(scopes) })
      });
    });
  } else {
    _.map(childIncludes, modelName => {
      modelName = modelName.replace(/\s/g, '');
      const childIncludeModel = _.get(childAssociations, modelName);
      if (childIncludeModel) {
        const scopes = getScopes(model, { prefix: `${as}.${modelName}` })(req);
        childInclude.push({
          ...extraData,
          model: _.isEmpty(scopes) ? childIncludeModel : childIncludeModel.scope(scopes),
          as: modelName,
          attributes: getReqAttributes(req, { valueKey: `'${as}.${modelName}.attributes'` }),
          include: getChildInclude(childIncludeModel, `${as}.${modelName}`)(req),
          required: getRequired(req, { prefix: `${as}.${modelName}`, defaultValue: !_.isEmpty(scopes) }),
          order: getOrder(model)(req, { prefixKey: `${as}.${modelName}` })
        });
      }
    });
  }

  return childInclude;
};

export const getInclude = (Model = rq('Model'), { paranoid = true, custom = [] } = {}) => (req = rq('req')) => {
  if (_.isEmpty(req)) return [];
  const { include } = _.get(req, 'query', {});
  if (!include && _.isEmpty(custom)) return [];
  const all = include === 'all';
  // if (all && _.isEmpty(required) && _.isEmpty(custom)) return { all: true };

  const result = [];
  const models = include ? include.split(',') : [];
  const associations = modelAssociationsObject(Model);

  if (all) {
    _.forOwn(associations, (model, key) => {
      const scopes = getScopes(model, { prefix: key })(req);
      result.push({
        model: _.isEmpty(scopes) ? model : model.scope(scopes),
        as: key,
        scope: getScopes(model, { prefix: key })(req),
        attributes: getReqAttributes(req, { valueKey: `'${key}.attributes'` }),
        include: getChildInclude(model, key)(req),
        required: getRequired(req, { prefix: key, defaultValue: !_.isEmpty(scopes) })
      });
    });
  } else {
    models.forEach(val => {
      // eslint-disable-next-line no-param-reassign
      val = val.replace(/\s/g, '');
      let inCustom = false;
      if (!_.isEmpty(custom)) {
        if (!_.isEmpty(_.find(custom, o => o.as === val))) {
          inCustom = true;
        }
      }

      if (associations[val] && !inCustom) {
        const model = associations[val];
        const scopes = getScopes(model, { prefix: val })(req);

        result.push({
          model: _.isEmpty(scopes) ? model : model.scope(scopes),
          as: val,
          paranoid,
          include: getChildInclude(model, val, { paranoid })(req),
          required: getRequired(req, { prefix: val, defaultValue: !_.isEmpty(scopes) }),
          attributes: getReqAttributes(req, { valueKey: `'${val}.attributes'` })
        });
      }
    });
  }

  if (!_.isEmpty(custom)) {
    _.map(custom, option => {
      result.push(option);
    });
  }

  return result;
};

export const getScopes = (Model = rq('Model'), { ignoreSearchType = [], prefix = '' } = {}) => (req = rq('req')) => {
  const scopes = [];

  const modelAttributes = [];
  _.forOwn(Model.rawAttributes, (val, key) => {
    modelAttributes.push(key);
    modelAttributes.push(`!${key}`);
  });

  if (!_.isEmpty(prefix)) prefix += '.';
  const query = _.get(req, 'query', {});
  const search = query[`${prefix}search`];
  const keyword = query[`${prefix}keyword`];
  const searchType = query[`${prefix}searchType`] || SEARCH_TYPES.MATCH;

  if (!_.isEmpty(search) && !_.isEmpty(keyword)) scopes.push({ method: ['search', { searchType, search: search || '', keyword: keyword || '' }] });

  _.mapValues(query, (value, key) => {
    if (prefix && !key.startsWith(prefix)) return;
    if (prefix) key = key.replace(prefix, '');
    if (!_.includes(modelAttributes, key)) return;

    if (value !== '' && value !== undefined && value !== 'undefined') {
      if (_.toLower(value) === 'null') value = null;
      if (_.toLower(value) === 'false') value = false;
      if (_.toLower(value) === 'true') value = true;

      if (_.includes(ignoreSearchType, key)) {
        scopes.push({ method: [key, { value }] });
      } else {
        scopes.push({ method: [key, { searchType, value }] });
      }
    }
  });

  return scopes;
};

export const getOrder = (Model = rq('Model')) => (req = rq('req'), { extra = [] } = {}) => {
  const includes = getInclude(Model)(req);
  const orderColumn = _.get(req, `query.orderColumn`, null);
  const orderBy = _.get(req, `query.orderBy`, 'ASC');
  const order = [...extra];

  const childOrderFunc = (inc, { parentInclude = [], prefix = '' } = {}) => {
    const { include } = inc;
    const column = _.get(req, `query['${prefix}${prefix ? '.' : ''}${inc.as}.orderColumn']`);
    const by = _.get(req, `query['${prefix}${prefix ? '.' : ''}${inc.as}.orderBy']`, 'ASC');
    const parentInc = [...parentInclude, { model: inc.model, as: inc.as }];

    if (column) {
      const columns = splitStringToArray(column, ',');
      const orders = splitStringToArray(by, ',');
      _.map(columns, (col, index) => {
        const ob = _.get(orders, `[${index}]`, _.get(orders, '[0]', 'ASC'));
        if (_.toUpper(ob) === 'ASC' || _.toUpper(ob) === 'DESC') {
          order.push([...parentInc, col, ob]);
        }
      });
    }

    _.map(include, inc2 => {
      childOrderFunc(inc2, { parentInclude: parentInc, prefix: inc.as });
    });
  };

  if (Model) {
    if (!orderColumn) {
      if (_.has(Model.rawAttributes, 'createdAt')) {
        order.push(['createdAt', orderBy || 'DESC']); // Default
      }
    }
  }

  if (orderColumn) {
    const columns = splitStringToArray(orderColumn, ',');
    const orders = splitStringToArray(orderBy, ',');
    _.map(columns, (col, index) => {
      const ob = _.get(orders, `[${index}]`, _.get(orders, '[0]', 'ASC'));
      if (_.toUpper(ob) === 'ASC' || _.toUpper(ob) === 'DESC') {
        order.push([col, ob]);
      }
    });
  }

  _.map(includes, inc => {
    childOrderFunc(inc);
  });
  return order;
};

export const getAttributes = (req = rq('req')) => getReqAttributes(req);

export const getLimitOffset = (req = rq('req')) => {
  if (!req.query) return { limit: null, offset: null };
  let { limit, offset } = req.query;
  limit = limit ? _.toInteger(limit) : null;
  offset = offset ? _.toInteger(offset) : null;
  return { limit, offset };
};

export const getParanoid = (req = rq('req')) => {
  let { paranoid } = _.get(req, 'query', {});
  if (paranoid !== undefined) {
    if (paranoid === false || paranoid === 'false') paranoid = false;
  } else {
    paranoid = true;
  }
  return paranoid;
};

export const updateAuthData = data => (req, res, next) => {
  if (data instanceof Object !== true) throw new Error(`express.util: [updateAuthData]: param must be type of object`);
  req.authData = Object.assign({}, req.authData, data);
  next();
};

export const setDefaultOrderBy = order => (req, res, next) => {
  req.query.orderBy = order;
  next();
};

export const sendStreamToResponse = (res, stream, filename) => {
  res.header('Content-Disposition', `attachment; filename="${filename}"`);
  stream.pipe(res);
};

export const setResponseMessage = msg => (req, res, next) => {
  res.message = msg;
  return next();
};

export const parseReqData = (toIndex, { fromIndex, value, omit, replace = false, forceOmit = true }) => (req, res, next) => {
  try {
    if (!toIndex || (!fromIndex && !value && _.isEmpty(omit))) return next();
    if (value || fromIndex) {
      if (replace) {
        _.update(req, toIndex, () => value || _.get(req, fromIndex));
      } else {
        _.update(req, toIndex, () => {
          const parse = value || _.get(req, fromIndex);
          if (_.isObject(parse)) {
            const val = _.get(req, toIndex, {});
            return { ...val, ...parse };
          }
          return parse;
        });
      }
    }

    if (!_.isEmpty(omit)) {
      if (_.isObject(_.get(req, toIndex))) {
        _.update(req, toIndex, () => _.omit(_.get(req, toIndex), omit));
      } else if (forceOmit) {
        const splitted = splitStringToArray(toIndex, '.');
        const index = _.get(splitted, '[0]');
        if (index) _.update(req, index, () => _.omit(_.get(req, index), omit));
      }
    }

    return next();
  } catch (e) {
    return next(e);
  }
};

export const validateRecordCount = (Model, { where = {}, fromIndexes = [], recordName } = {}) => async (req, res, next) => {
  try {
    const query = { ...where };
    _.map(fromIndexes, index => {
      let sourceKey;
      let targetKey;
      if (_.isString(index)) {
        sourceKey = index;
      } else if (_.isObject(index)) {
        sourceKey = _.get(index, 'sourceKey');
        targetKey = _.get(index, 'targetKey');
      }

      if (!sourceKey) return;
      const value = _.get(req, sourceKey);

      if (value) {
        if (targetKey) {
          query[targetKey] = value;
        } else {
          const splitted = splitStringToArray(index, '.');
          const key = _.get(splitted, splitted.length - 1);
          if (key) query[key] = value;
        }
      }
    });

    if (_.isEmpty(query)) return next();
    const count = await Model.count({ where: query });
    if (count <= 0) throw new Error(`${recordName || Model.name} not found`);
    return next();
  } catch (e) {
    return next(e);
  }
};

export const getClientTimezone = req => _.get(req, 'headers.timezone');
