import {
  Users,
  Products,
  SalesOrders,
  Addresses,
  Comments,
  Notifications,
  Subscriptions,
  Packages
} from '@models';
import { getScopes, getLimitOffset } from '@utils/express.util';
import { SequelizeConnector as Sequelize } from '@configs/sequelize-connector.config';

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

export const deleteCustomer = async (req, res, next) => {
  try {
    const { id: customerId } = req.params;
    const { id } = req.user;

    await Sequelize.transaction(async transaction => {
      const orders = await SalesOrders.findAll({
        where: { userId: customerId },
        paranoid: false,
        transaction
      });
      const addressId = orders.map(order => order.addressId);

      const addresses = await Addresses.findAll({
        where: { id: addressId },
        paranoid: false,
        transaction
      });
      await Promise.all(
        addresses.map(async instance => {
          await instance.update({ userId: null }, { transaction });
        })
      );

      await Promise.all(
        orders.map(async instance => {
          await instance.update({ userId: null }, { transaction });
        })
      );

      const comments = await Comments.findAll({
        where: { userId: customerId },
        paranoid: false,
        transaction
      });

      await Promise.all(
        comments.map(async instance => {
          await instance.update({ userId: null }, { transaction });
        })
      );

      const notifications = await Notifications.findAll({
        where: { actorId: customerId },
        paranoid: false,
        transaction
      });

      await Promise.all(
        notifications.map(async instance => {
          await instance.update({ actorId: null }, { transaction });
        })
      );

      const user = await Users.findOne({ where: { id: customerId } });

      await user.destroy({ force: true, transaction });
    });

    return res.status(200).json({ message: 'Delete success' });
  } catch (e) {
    return next(e);
  }
};

export const getOneCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await Users.findOne({
      where: { id },
      include: [
        {
          model: Subscriptions,
          as: 'subscription',
          include: [
            {
              model: Packages,
              as: 'package'
            }
          ]
        },
        { model: Addresses, as: 'addresses' }
      ]
    });
    return res.status(200).json({ message: 'success', payload: user });
  } catch (e) {
    return next(e);
  }
};
