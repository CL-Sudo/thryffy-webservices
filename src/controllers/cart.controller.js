import { CartItems, Products, Users, Addresses, SalesOrders, OrderItems } from '@models';
import * as services from '@services/checkout.service';
import R from 'ramda';
import { PAYMENT_STATUS, DELIVERY_STATUS } from '@constants';
import { SequelizeConnector as Sequelize } from '@configs/sequelize-connector.config';
import { requestValidator } from '@validators';

export const list = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const { id } = req.user;

    const cart = await CartItems.findAll({
      attributes: ['productId'],
      raw: true,
      where: {
        userId: id
      }
    });

    const productIds = R.map(R.prop('productId'))(cart);

    const payload = await Users.scope({ method: ['cart', productIds] }).findAndCountAll({
      limit: Number(limit) || null,
      offset: Number(offset) || null
    });

    return res.status(200).json({
      message: 'success',
      payload
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
            productId
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

    return res.status(200).json({
      message: 'success'
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

    return res.status(200).json({
      message: 'success'
    });
  } catch (e) {
    return next(e);
  }
};

export const checkout = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { productIds, addressId, paymentMethod, courier } = req.body;

    const payload = await Users.scope({ method: ['cart', productIds] }).findOne();

    const defaultAddress = await Addresses.scope({ method: ['defaultId', id] }).findOne();

    const priceSummary = await services.getPriceSummary({
      courier,
      productIds,
      addressId: addressId || R.propOr(null, 'id')(defaultAddress)
    });

    return res.status(200).json({
      message: 'success',
      payload: {
        itemQuantity: payload.dataValues.products.length,
        ...payload.dataValues,
        shippingAddress: defaultAddress,
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

    const { subTotal, tax, total, shippingFee } = await services.getPriceSummary({
      productIds,
      addressId,
      courier
    });

    const fakeTrackingNo = 'MCB000134456';

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
            deliveryStatus: DELIVERY_STATUS.PAID,
            deliveryTrackingNo: fakeTrackingNo,
            subTotal,
            shippingFee,
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
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    };

    await R.pipeP(storeSaleOrder, parseOrderItems(productIds), storeOrderItems)();

    await transaction.commit();
    return res.status(200).json({
      message: 'success'
    });
  } catch (e) {
    await transaction.rollback();
    return next(e);
  }
};
