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
import { PAYMENT_STATUS, DELIVERY_STATUS } from '@constants';
import { SequelizeConnector as Sequelize } from '@configs/sequelize-connector.config';
import { requestValidator } from '@validators';
import { cartListener } from '@listeners';
import { paginate } from '@utils';

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
    const { productIds, paymentMethod, courier } = req.body;

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
  const transaction = await Sequelize.transaction();
  try {
    requestValidator(req);

    const { id: userId } = req.user;
    const { productIds, addressId, courier, paymentMethod } = req.body;

    const { subTotal, tax, total, shippingFeeId } = await services.getPriceSummary(productIds);

    const parseOrderItems = ids => async salesOrderId => {
      try {
        const products = await Products.findAll({
          raw: true,
          attributes: ['id'],
          where: { id: ids }
        });
        const parseObj = R.applySpec({
          salesOrderId: R.always(salesOrderId),
          productId: R.prop('id')
        });
        const arr = R.map(parseObj)(products);
        return Promise.resolve(arr);
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const storeSaleOrder = async () => {
      try {
        const saleOrder = await SalesOrders.create(
          {
            userId,
            addressId,
            paymentMethod,
            courier,
            paymentStatus: PAYMENT_STATUS.SUCCESS,
            deliveryStatus: DELIVERY_STATUS.TO_SHIP,
            subTotal,DELIVERY_STATUS
            shippingFeeId,
            tax,
            total
          },
          { transaction }
        );
        return Promise.resolve(saleOrder.id);
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const storeOrderItems = async storeArrObj => {
      try {
        await OrderItems.bulkCreate(storeArrObj, { transaction });
        await transaction.commit();
        return Promise.resolve(storeArrObj[0].salesOrderId);
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const getPayload = async salesOrderId => {
      try {
        const order = await SalesOrders.scope({
          method: ['orderDetails', salesOrderId]
        }).findOne();
        await order.getItemQuantity();
        const { seller } = order.orderItems[0].product;
        const payload = R.assoc('seller', seller)(order.dataValues);
        return Promise.resolve(payload);
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const payload = await R.pipeP(
      storeSaleOrder,
      parseOrderItems(productIds),
      storeOrderItems,
      getPayload
    )();

    cartListener.emit('Payment Made', productIds);

    return res.status(200).json({
      message: 'success',
      payload
    });
  } catch (e) {
    await transaction.rollback();
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
