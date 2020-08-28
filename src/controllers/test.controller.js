import R from 'ramda';
import { Products, SalesOrders } from '@models';
import { db, SequelizeConnector as Sequelize } from '@configs/sequelize-connector.config';
import { Op } from 'sequelize';
import * as utils from '@utils';

export const test = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    // const result = await Products.scope('listings').findAll({ where: { userId: 1 } });

    const result = await SalesOrders.scope({ method: ['listings', 1, req.body.test] }).findAll();

    return res.status(200).json({
      message: 'success',
      count: R.length(result),
      result
    });
  } catch (e) {
    return next(e);
  }
};
