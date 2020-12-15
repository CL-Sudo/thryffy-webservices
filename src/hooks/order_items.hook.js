import { OrderItems, SalesOrders, ShippingFees, Products, Commissions, CartItems } from '@models';

import { getProductCommission } from '@services/product.service';

import PARCEL_TYPES from '@constants/parcel_types.constant';

import R from 'ramda';

OrderItems.addHook('afterBulkCreate', 'getParcelType', async (results, options) => {
  try {
    const { transaction } = options;

    const order = await SalesOrders.findOne({
      where: { id: results[0].salesOrderId },
      transaction
    });

    switch (results.length) {
      case 1: {
        const shippingFee = await ShippingFees.findOne({
          where: { id: order.shippingFeeId }
        });
        await order.update({ parcelType: shippingFee.type }, { transaction });
        break;
      }

      case 2: {
        await order.update({ parcelType: PARCEL_TYPES.LARGE_PARCEL }, { transaction });
        break;
      }

      case 3:
        await order.update({ parcelType: PARCEL_TYPES.LARGE_PARCEL }, { transaction });
        break;

      default:
        throw new Error('Invalid order size');
    }
  } catch (e) {
    throw e;
  }
});

OrderItems.addHook('afterBulkCreate', 'getCommission', async (results, options) => {
  try {
    const { transaction } = options;

    const order = await SalesOrders.findOne({
      where: { id: results[0].salesOrderId },
      transaction
    });

    const items = await OrderItems.findAll({
      transaction,
      where: { salesOrderId: results[0].salesOrderId },
      include: [
        {
          model: Products,
          as: 'product'
        }
      ]
    });

    const rates = await Commissions.findAll({ raw: true });

    const commission = R.pipe(
      R.map(R.path(['product', 'originalPrice'])),
      R.map(getProductCommission(rates)),
      R.sum
    )(items);

    await order.update({ commission }, { transaction });
  } catch (e) {
    throw e;
  }
});

OrderItems.addHook('afterBulkCreate', 'removeCartItems', async (results, options) => {
  try {
    const { transaction } = options;

    const productIds = R.map(R.prop('productId'))(results);

    await CartItems.destroy({ where: { productId: productIds }, transaction });
  } catch (e) {
    throw e;
  }
});
