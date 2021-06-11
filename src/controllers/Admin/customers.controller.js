import {
  Users,
  Products,
  SalesOrders,
  Addresses,
  Comments,
  Notifications,
  Subscriptions,
  Packages,
  NotificationSettings,
  CartItems,
  Enquiries,
  Followings,
  NotificationTopicUsers,
  FavouriteProducts,
  Preferences,
  Reviews,
  Otps
} from '@models';
import { getScopes, getLimitOffset } from '@utils/express.util';
import { SequelizeConnector as Sequelize } from '@configs/sequelize-connector.config';
import { Op } from 'sequelize';

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

    await Sequelize.transaction(async transaction => {
      const orders = await SalesOrders.findAll({
        where: { userId: customerId },
        paranoid: false,
        transaction
      });

      const sellingOrder = await SalesOrders.findAll({
        where: { sellerId: customerId },
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

      await Promise.all(
        sellingOrder.map(async instance => {
          await instance.update({ sellerId: null }, { transaction });
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

      await NotificationSettings.destroy({
        where: { userId: customerId },
        force: true,
        transaction
      });

      await CartItems.destroy({ where: { userId: customerId }, force: true, transaction });

      await Enquiries.update(
        { userId: null },
        { where: { userId: customerId }, force: true, transaction }
      );

      await Promise.all(
        notifications.map(async instance => {
          await instance.update({ actorId: null }, { transaction });
        })
      );

      await Followings.destroy({
        where: { [Op.or]: [{ followerId: customerId }, { sellerId: customerId }] },
        force: true,
        transaction
      });

      await Subscriptions.destroy({ where: { userId: customerId }, force: true, transaction });

      await Notifications.destroy({ where: { notifierId: customerId }, force: true, transaction });

      await NotificationTopicUsers.destroy({
        where: { userId: customerId },
        force: true,
        transaction
      });

      await Addresses.destroy({ where: { userId: customerId }, force: true, transaction });

      await FavouriteProducts.destroy({ where: { userId: customerId }, force: true, transaction });

      await Preferences.destroy({ where: { userId: customerId }, force: true, transaction });

      await Reviews.destroy({ where: { sellerId: customerId }, force: true, transaction });

      await Products.update({ userId: null }, { where: { userId: customerId }, transaction });

      const user = await Users.findOne({ where: { id: customerId }, transaction });

      await Otps.destroy({
        where: { phoneCountryCode: user.phoneCountryCode, phoneNumber: user.phoneNumber },
        force: true,
        transaction
      });

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
