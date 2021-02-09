/* eslint-disable no-param-reassign */
import _ from 'lodash';
import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';
import {
  getInclude,
  getAttributes,
  getOrder,
  getScopes,
  getLimitOffset,
  getParanoid,
  getClientTimezone
} from '@utils/express.util';

export const read = (
  Model,
  req,
  {
    limit,
    offset,
    include,
    scopes,
    attributes,
    order,
    paranoid = true,
    distinct = true,
    extra = {},
    where,
    customInclude
  } = {}
) =>
  new Promise(async (resolve, reject) => {
    try {
      const timezone = getClientTimezone(req);
      const reqPagination = getLimitOffset(req);
      const scopesVal = scopes || getScopes(Model)(req);
      const M = _.isEmpty(scopesVal) ? Model : Model.scope(scopesVal);
      const payload = await M.findAndCountAll({
        include: include || getInclude(Model, { paranoid, custom: customInclude })(req),
        limit: limit || reqPagination.limit,
        offset: offset || reqPagination.offset,
        attributes: attributes || getAttributes(req),
        order: order || getOrder(Model)(req),
        distinct,
        paranoid,
        where,
        timezone,
        ...extra
      });
      return resolve(payload);
    } catch (e) {
      return reject(e);
    }
  });

export const readOne = (Model, req, { paranoid, include, scopes, attributes, where, order } = {}) =>
  new Promise(async (resolve, reject) => {
    try {
      const { id, query = {} } = req.params;
      const queryWhere = { ...query, ...where };
      if (id) queryWhere.id = id;

      const timezone = getClientTimezone(req);
      const scopesVal = scopes || getScopes(Model)(req);
      const M = _.isEmpty(scopesVal) ? Model : Model.scope(scopesVal);
      const payload = await M.findOne({
        where: queryWhere,
        include: include || getInclude(Model, { paranoid })(req),
        attributes: attributes || getAttributes(req),
        paranoid: paranoid || getParanoid(req),
        order: order || getOrder(Model)(req),
        timezone,
        actionBy: req.authData.id
      });
      if (!payload) return reject(new Error(`${Model.name} record not found`));
      return resolve(payload);
    } catch (e) {
      return reject(e);
    }
  });

const crud = (Model, { paranoid = true, includeParanoid = true } = {}) => ({
  create: async (req, res, next) => {
    try {
      const { id } = req.authData;
      const createBody = { ...req.body, createdBy: id };
      const result = await Model.create(createBody);

      const include = getInclude(Model)(req);
      const attributes = getAttributes(req);
      const payload = await Model.findOne({ where: { id: result.id }, include, attributes });
      return res.status(200).json({ message: 'Success', payload });
    } catch (e) {
      return next(e);
    }
  },
  read: async (req, res, next) => {
    try {
      const { extra, where, customInclude, defaultScope } = req.query;
      const payload = await read(Model, req, {
        paranoid: paranoid ? getParanoid(req) : paranoid,
        extra,
        where,
        customInclude,
        defaultScope
      });
      return res.status(200).json({ message: 'Success', payload });
    } catch (e) {
      return next(e);
    }
  },
  readOne: async (req, res, next) => {
    try {
      const { where } = req.query;
      const payload = await readOne(Model, req, { where });
      return res.status(200).json({ message: 'Success', payload });
    } catch (e) {
      return next(e);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id, query = {} } = req.params;
      const scopes = getScopes(Model)(req);
      const col = await Model.scope(scopes).findOne({
        where: { ...query, ..._.get(req, 'query.where', {}), id, deletedAt: null }
      });
      if (!col) return next(new Error('Record not found'));

      if (_.isEmpty(_.omit(req.body, ['updatedBy'])))
        return res.status(202).json({ message: 'Request body is empty' });

      await sequelize.transaction(async transaction => {
        await Model.update(
          { ...req.body, updatedBy: req.authData.id },
          { where: { id }, individualHooks: true, transaction, req }
        );
      });

      const include = getInclude(Model)(req);
      const attributes = getAttributes(req);
      const payload = await Model.findOne({ where: { id }, include, attributes });
      return res.status(200).json({ message: 'Update success', payload });
    } catch (e) {
      return next(e);
    }
  },
  destroy: async (req, res, next) => {
    try {
      const { id, query = {} } = req.params;
      const result = await Model.findOne({
        where: { ...query, ..._.get(req, 'query.where', {}), id }
      });

      if (!result) return next(new Error('Data not exists'));
      await sequelize.transaction(async transaction => {
        await result.destroy({ transaction });
        await result.update({ deletedBy: req.authData.id }, { transaction });
      });
      return res.status(200).json({ message: 'Delete success' });
    } catch (e) {
      return next(e);
    }
  },
  restore: async (req, res, next) => {
    try {
      const { id, query = {} } = req.params;
      const obj = await Model.findOne({ where: { ...query, id }, paranoid: false });
      await obj.restore();
      return res.status(200).json({ message: 'Restore success' });
    } catch (e) {
      return next(e);
    }
  },
  activate: async (req, res, next) => {
    try {
      const { id } = req.params;
      const row = await Model.findOne({ where: { id } });
      if (!row) throw new Error('Data not exists');
      await row.update({ active: true });
      return res.status(200).json({ message: 'Record was successfully activated' });
    } catch (e) {
      return next(e);
    }
  },
  deactivate: async (req, res, next) => {
    try {
      const { id } = req.params;
      const row = await Model.findOne({ where: { id } });
      if (!row) throw new Error('Data not exists');
      await row.update({ active: false });
      return res.status(200).json({ message: 'Record was successfully deactivated' });
    } catch (e) {
      return next(e);
    }
  },
  selfCreate: async (req, res, next) => {
    try {
      const { id } = req.authData;
      let result;
      let createBody = { ...req.body, createdBy: id };
      if (Model.rawAttributes.userId) {
        createBody = { ...createBody, userId: id };
      }
      if (Model.rawAttributes.systemId) {
        createBody = { ...createBody, systemId: req.systemId };
      }
      if (Model.rawAttributes.regionId) {
        createBody = { ...createBody, regionId: req.regionId };
      }

      await sequelize.transaction(async transaction => {
        result = await Model.create(createBody, { transaction });
      });

      const include = getInclude(Model)(req);
      const attributes = getAttributes(req);
      const payload = await Model.findOne({ where: { id: result.id }, include, attributes });
      return res.status(200).json({ message: 'Success', payload });
    } catch (e) {
      return next(e);
    }
  },
  selfRead: async (req, res, next) => {
    try {
      const payload = await read(
        Model,
        req,
        { paranoid: paranoid ? getParanoid(req) : paranoid },
        true
      );
      return res.status(200).json({ message: 'Success', payload });
    } catch (e) {
      return next(e);
    }
  },
  selfReadOne: async (req, res, next) => {
    try {
      const { id } = req.params;
      const include = getInclude(Model, { paranoid: includeParanoid })(req);
      const attributes = getAttributes(req);
      const scopes = getScopes(Model)(req);
      const payload = await Model.scope(scopes).findOne({
        where: { id, userId: req.authData.id },
        include,
        attributes,
        paranoid: paranoid ? getParanoid(req) : paranoid
      });
      if (!payload) return next(new Error(`${Model.name} record not found: id ${id}`));
      return res.status(200).json({ message: 'Success', payload });
    } catch (e) {
      return next(e);
    }
  },
  selfUpdate: async (req, res, next) => {
    try {
      const { id } = req.params;
      const scopes = getScopes(Model)(req);
      const col = await Model.scope(scopes).findOne({
        where: { id, deletedAt: null, userId: req.authData.id }
      });
      if (!col) return next(new Error('Record not found'));
      await sequelize.transaction(async transaction => {
        await Model.update(
          { ...req.body, updatedBy: req.authData.id },
          { where: { id }, individualHooks: true, transaction }
        );
      });

      const include = getInclude(Model)(req);
      const attributes = getAttributes(req);
      const payload = await Model.findOne({ where: { id }, include, attributes });
      return res.status(200).json({ message: 'Update success', payload });
    } catch (e) {
      return next(e);
    }
  },
  selfDestroy: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await Model.findOne({ where: { id, userId: req.authData.id } });
      if (!result) return next(new Error('Data not exists'));
      await sequelize.transaction(async transaction => {
        await result.destroy({ transaction });
        await result.update({ deletedBy: req.authData.id }, { transaction });
      });
      return res.status(200).json({ message: 'Delete success' });
    } catch (e) {
      return next(e);
    }
  },
  selfRestore: async (req, res, next) => {
    try {
      const { id } = req.params;
      const obj = await Model.findOne({ where: { id, userId: req.authData.id }, paranoid: false });
      await obj.restore();
      return res.status(200).json({ message: 'Restore success' });
    } catch (e) {
      return next(e);
    }
  }
});

export { crud };
export default crud;
