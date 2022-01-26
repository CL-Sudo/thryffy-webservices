import {
  OrderItems,
  SalesOrders,
  ShippingFees,
  Products,
  Commissions,
  CommissionFreeCampaigns
} from '@models';

import { getProductCommission } from '@services/product.service';

import PARCEL_TYPES from '@constants/parcel_types.constant';

import R from 'ramda';
import { COUNTRIES } from '@constants/countries.constant';

OrderItems.addHook('afterBulkCreate', 'getParcelType', async (results, options) => {
  try {
    const { transaction } = options;

    const order = await SalesOrders.findOne({
      include: ['country'],
      where: { id: results[0].salesOrderId },
      transaction
    });

    if (order.country.code === COUNTRIES.MALAYSIA.CODE) {
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
    }

    if (order.country.code === COUNTRIES.BRUNEI.CODE) {
      await order.update({ parcelType: PARCEL_TYPES.ONZ_STANDARD }, { transaction });
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

    const rates = await Commissions.scope([{ method: ['byCountry', order.countryId] }]).findAll();

    const commissionFreeCampaigns = await CommissionFreeCampaigns.scope([
      { method: ['byCountry', order.countryId] },
      'runningCampaign'
    ]).findOne();

    const commission = commissionFreeCampaigns
      ? 0
      : R.pipe(
          R.map(R.path(['product', 'originalPrice'])),
          R.map(getProductCommission(rates)),
          R.sum
        )(items);

    await order.update({ commission }, { transaction });
  } catch (e) {
    throw e;
  }
});
