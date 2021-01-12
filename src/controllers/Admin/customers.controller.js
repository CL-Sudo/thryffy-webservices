import { Users, Products } from '@models';
import { Op } from 'sequelize';
import { paginate } from '@utils';
import { getScopes, getLimitOffset } from '@utils/express.util';

export const list = async (req, res, next) => {
  try {
    const scopes = getScopes(Users)(req);
    const { limit, offset } = getLimitOffset(req);

    const users = await Users.scope(scopes).findAndCountAll({
      limit,
      offset,
      // include: [{ model: Products, as: 'products' }],
      raw: true,
      hooks: false
    });

    return res
      .status(200)
      .json({ message: 'success', payload: { rows: users.rows, count: users.count } });
  } catch (e) {
    return next(e);
  }
};

export const getCustomerProductRequest = async (req, res, next) => {
  try {
    const { id: customerId } = req.params;
    const scopes = getScopes(Products)(req);
    const { limit, offset } = getLimitOffset(req);

    const products = await Products.scope(scopes).findAndCountAll({
      where: { userId: customerId },
      limit,
      offset,
      raw: true
    });

    return res.status(200).json({ message: 'Success', payload: products });
  } catch (e) {
    return next(e);
  }
};
