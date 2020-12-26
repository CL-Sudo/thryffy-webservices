import {
  CartItems,
  Products,
  Users,
  Addresses,
  SalesOrders,
  OrderItems,
  FavouriteProducts
} from '@models';
import * as services from '@services/checkout.service';
import R from 'ramda';
import { PAYMENT_STATUS } from '@constants';
import { SequelizeConnector as Sequelize } from '@configs/sequelize-connector.config';
import { requestValidator } from '@validators';
import { paginate } from '@utils';

import Billplz from '@services/billplz.service';

const getLatestCartList = async userId => {
  try {
    const cart = await CartItems.findAll({
      attributes: ['productId'],
      raw: true,
      where: {
        userId
      }
    });

    const productIds = R.map(R.prop('productId'))(cart);

    const payload = await Users.scope({ method: ['cart', productIds] }).findAll();
    return Promise.resolve(payload);
  } catch (e) {
    return Promise.reject(e);
  }
};

export const list = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const { id } = req.user;

    const payload = await getLatestCartList(id);

    return res.status(200).json({
      message: 'success',
      payload: {
        count: payload.length,
        rows: paginate(limit)(offset)(payload)
      }
    });
  } catch (e) {
    return next(e);
  }
};

export const add = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { productId } = req.body;

    const checkProductIdValidity = async () => {
      try {
        const product = await Products.findOne({
          raw: true,
          where: { id: productId }
        });
        if (R.isNil(product)) {
          throw new Error('Invalid productId given');
        }
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const checkIsItemExisted = async () => {
      try {
        const cartItem = await CartItems.findOne({
          raw: true,
          where: {
            productId,
            userId: id
          }
        });
        if (R.not(R.isNil(cartItem))) {
          throw new Error('This item is already in your bag');
        }
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const addToCart = async () => {
      try {
        await CartItems.create({
          userId: id,
          productId
        });
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    };

    await R.pipeP(checkProductIdValidity, checkIsItemExisted, addToCart)();

    const payload = await getLatestCartList(id);

    return res.status(200).json({
      message: 'success',
      payload: {
        count: payload.length,
        rows: paginate(10)(0)(payload)
      }
    });
  } catch (e) {
    return next(e);
  }
};

export const deleteOne = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { productId } = req.params;

    const item = await CartItems.findOne({
      where: {
        userId: id,
        productId
      }
    });

    if (R.isNil(item)) {
      throw new Error('Invalid productId given, no item found');
    }

    item.destroy({ force: true });

    const payload = await getLatestCartList(id);

    return res.status(200).json({
      message: 'success',
      payload: {
        count: payload.length,
        rows: paginate(10)(0)(payload)
      }
    });
  } catch (e) {
    return next(e);
  }
};

export const checkout = async (req, res, next) => {
  try {
    requestValidator(req);
    const { id } = req.user;
    const { productIds } = req.body;

    const payload = await Users.scope({ method: ['cart', productIds] }).findOne();

    const defaultAddress = await Addresses.scope({ method: ['defaultId', id] }).findOne();

    const priceSummary = await services.getPriceSummary(productIds);

    return res.status(200).json({
      message: 'success',
      payload: {
        itemCount: payload.dataValues.products.length,
        ...payload.dataValues,
        defaultAddress,
        priceSummary
      }
    });
  } catch (e) {
    return next(e);
  }
};

export const pay = async (req, res, next) => {
  try {
    requestValidator(req);

    const { id: userId } = req.user;
    const { productIds, addressId } = req.body;

    const { subTotal, tax, total, shippingFeeId } = await services.getPriceSummary(productIds);

    const orderId = await Sequelize.transaction(async transaction => {
      const product = await Products.findOne({ where: { id: productIds[0] } });

      const saleOrder = await SalesOrders.create(
        {
          userId,
          sellerId: product.userId,
          addressId,
          paymentStatus: PAYMENT_STATUS.PENDING,
          subTotal,
          shippingFeeId,
          tax,
          total
        },
        { transaction }
      );

      const orderItems = R.map(
        R.applySpec({
          salesOrderId: R.always(saleOrder.id),
          productId: R.prop('id')
        })
      )(
        await Products.findAll({
          where: { id: productIds }
        })
      );

      await OrderItems.bulkCreate(orderItems, { transaction });

      return saleOrder.id;
    });

    const order = await SalesOrders.scope({
      method: ['orderDetails', orderId]
    }).findOne();

    const user = await Users.findOne({ where: { id: userId } });
    const billplz = new Billplz();

    const { NODE_ENV, SERVER_URL, NGROK_URL } = process.env;
    const serverUrl = NODE_ENV === 'DEV' ? NGROK_URL : SERVER_URL;

    const response = await billplz.createBill({
      amount: order.total,
      email: user.email,
      mobile: user.completePhoneNumber,
      name: user.fullName,
      itemName: `Order ${order.orderRef}`,
      redirectUrl: `${serverUrl}/api/publics/billplz/redirect?orderId=${order.id}`,
      callbackUrl: `${serverUrl}/api/publics/billplz/callback?orderId=${order.id}`
    });

    return res.status(200).json({ message: 'success', payload: response.data });
  } catch (e) {
    console.log('e.response.data', e.response.data);
    return next(e);
  }
};

export const saveForLater = async (req, res, next) => {
  try {
    requestValidator(req);

    const { productId } = req.body;
    const { id } = req.user;

    await CartItems.destroy({ force: true, where: { productId, userId: id } });

    await FavouriteProducts.create({
      productId,
      userId: id
    });

    const payload = await getLatestCartList(id);

    return res.status(200).json({
      message: 'success',
      payload: {
        count: payload.length,
        rows: paginate(10)(0)(payload)
      }
    });
  } catch (e) {
    return next(e);
  }
};
