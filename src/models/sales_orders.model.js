import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import {
  AT_RECORDER,
  BY_RECORDER,
  primaryKey,
  foreignKey,
  defaultExcludeFields
} from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';
import { PAYMENT_STATUS, DELIVERY_STATUS } from '@constants';

import {
  OrderItems,
  Users,
  Products,
  Addresses,
  Brands,
  ShippingFees,
  Reviews,
  Sizes
} from '@models';
import R from 'ramda';
import { Op } from 'sequelize';
import Moment from 'moment';
import { parseParcelName } from '@utils/sales_orders.util';
import Conditions from './conditions.model';
import Categories from './categories.model';
import DeliverySlips from './delivery_slips.model';
import Galleries from './galleries.model';

const assignDeliveryStatus = status => whereObj =>
  R.ifElse(
    R.equals('ALL'),
    R.always(whereObj),
    R.always(R.assoc('deliveryStatus', status, whereObj))
  )(status);

const SalesOrders = SequelizeConnector.define(
  'SalesOrders',
  {
    id: primaryKey,
    countryId: foreignKey('country_id', 'countries', { allowNull: true, onDelete: 'SET NULL' }),
    shippingFeeId: foreignKey('shipping_fee_id', 'shipping_fees', false),
    userId: foreignKey('user_id', 'users', false),
    sellerId: foreignKey('seller_id', 'users', false),
    addressId: foreignKey('address_id', 'addresses', false),
    billId: {
      type: Sequelize.STRING,
      field: 'bill_id'
    },
    transactionId: {
      field: 'transaction_id',
      type: Sequelize.STRING(30)
    },
    orderRef: {
      type: Sequelize.STRING(20),
      field: 'order_ref'
    },
    parcelType: {
      type: Sequelize.STRING(20),
      field: 'parcel_type'
    },
    paymentMethod: {
      type: Sequelize.STRING(50),
      field: 'payment_method'
    },
    courier: {
      type: Sequelize.STRING(30)
    },
    paymentStatus: {
      type: Sequelize.STRING(50),
      field: 'payment_status',
      defaultValue: PAYMENT_STATUS.PENDINGS
    },
    deliveryStatus: {
      type: Sequelize.STRING(50),
      field: 'delivery_status',
      defaultValue: DELIVERY_STATUS.DID_NOT_SHIP
    },
    deliveryTrackingNo: {
      type: Sequelize.TEXT,
      field: 'delivery_tracking_no'
    },
    deliveryTrackingUrl: {
      type: Sequelize.TEXT,
      field: 'delivery_tracking_url'
    },
    subTotal: {
      type: Sequelize.DECIMAL(10, 2),
      field: 'sub_total'
    },
    tax: {
      type: Sequelize.DECIMAL(10, 2)
    },
    total: {
      type: Sequelize.DECIMAL(10, 2)
    },
    commission: {
      type: Sequelize.DECIMAL(10, 2)
    },
    isCommissionPaid: {
      type: Sequelize.BOOLEAN,
      field: 'is_commission_paid',
      defaultValue: false
    },
    commissionPaidAt: {
      type: Sequelize.DATE,
      field: 'commission_paid_at'
    },
    paidAt: {
      type: Sequelize.DATE,
      field: 'paid_at'
    },
    hasBuyerDispute: {
      type: Sequelize.BOOLEAN,
      field: 'has_buyer_dispute',
      defaultValue: false
    },
    hasSellerDispute: {
      type: Sequelize.BOOLEAN,
      field: 'has_seller_dispute',
      defaultValue: false
    },
    shippedAt: {
      type: Sequelize.DATE,
      field: 'shipped_at'
    },
    shippingReminderCount: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      field: 'shipping_reminder_count'
    },
    hoursAfterPayment: {
      type: Sequelize.VIRTUAL,
      get() {
        if (!this.getDataValue('paidAt')) return null;
        const paidAt = Moment(this.getDataValue('paidAt')).format('YYYY-MM-DD HH:mm:ss');
        const currentDate = Moment();
        const diff = currentDate.diff(paidAt, 'hours');

        return diff;
      }
    },
    itemQuantity: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.getDataValue('itemQuantity');
      }
    },
    hasReviewed: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.getDataValue('hasReviewed');
      }
    },
    parcelName: {
      type: Sequelize.VIRTUAL,
      get() {
        return parseParcelName(this.getDataValue('parcelType'));
      }
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'sales_orders',
    scopes: {
      search: params => search(SalesOrders, params, []),
      orderDetails(orderId) {
        return {
          where: { id: orderId },
          include: [
            {
              model: OrderItems,
              as: 'orderItems',
              attributes: { exclude: defaultExcludeFields },
              include: [
                {
                  model: Products,
                  as: 'product',
                  paranoid: false,
                  include: [
                    {
                      paranoid: false,
                      model: Users,
                      as: 'seller',
                      attributes: {
                        exclude: [
                          ...defaultExcludeFields,
                          'refreshToken',
                          'facebookId',
                          'googleId',
                          'otpValidity',
                          'loginFrequency',
                          'lastLogin',
                          'resetToken',
                          'active',
                          'isVerified',
                          'password'
                        ]
                      }
                    },
                    { model: Sizes, as: 'size', attributes: { exclude: defaultExcludeFields } },
                    {
                      model: Brands,
                      as: 'brand',
                      attributes: { exclude: defaultExcludeFields }
                    },
                    {
                      model: Conditions,
                      as: 'condition',
                      attributes: { exclude: defaultExcludeFields }
                    },
                    {
                      model: Categories,
                      as: 'category',
                      attributes: { exclude: defaultExcludeFields }
                    },
                    {
                      model: Galleries,
                      as: 'photos',
                      attributes: { exclude: defaultExcludeFields }
                    }
                  ]
                }
              ]
            },
            {
              model: Addresses,
              as: 'address',
              attributes: { exclude: defaultExcludeFields }
            },
            {
              model: ShippingFees,
              as: 'shippingFee',
              attributes: { exclude: defaultExcludeFields }
            },
            {
              model: DeliverySlips,
              as: 'deliverySlips',
              attributes: { exclude: defaultExcludeFields }
            }
          ]
        };
      },
      sold(userId, deliveryStatus) {
        const processedDeliveryStatus = R.cond([
          [R.equals('TOSHIP'), R.always(DELIVERY_STATUS.TO_SHIP)],
          [R.T, R.identity]
        ])(R.toUpper(deliveryStatus));

        const initialWhereObj = {
          paymentStatus: PAYMENT_STATUS.SUCCESS,
          id: {
            [Op.in]: [
              Sequelize.literal(`
                  SELECT sales_order_id FROM order_items
                  WHERE product_id IN (
                    SELECT id from  products
                    WHERE user_id = ${userId}
                  )
                `)
            ]
          }
        };

        const where = assignDeliveryStatus(processedDeliveryStatus)(initialWhereObj);

        return {
          attributes: { exclude: ['deletedAt', 'createdBy', 'updatedBy', 'deletedBy'] },
          where,
          include: [
            {
              attributes: { exclude: defaultExcludeFields },
              model: OrderItems,
              as: 'orderItems',
              include: [
                {
                  attributes: { exclude: defaultExcludeFields },
                  model: Products,
                  as: 'product',
                  include: [
                    {
                      model: Brands,
                      as: 'brand',
                      attributes: { exclude: defaultExcludeFields }
                    },
                    { model: Sizes, as: 'size', attributes: { exclude: defaultExcludeFields } }
                  ]
                }
              ]
            }
          ],
          order: [['createdAt', 'DESC']]
        };
      },
      bought(userId, deliveryStatus) {
        const processedDeliveryStatus = R.cond([
          [R.equals('TOSHIP'), R.always(DELIVERY_STATUS.TO_SHIP)],
          [R.T, R.identity]
        ])(R.toUpper(deliveryStatus));

        const initialWhereObj = {
          userId,
          paymentStatus: PAYMENT_STATUS.SUCCESS
        };

        const where = assignDeliveryStatus(processedDeliveryStatus)(initialWhereObj);

        return {
          where,
          attributes: { exclude: ['deletedAt', 'createdBy', 'updatedBy', 'deletedBy'] },
          include: [
            {
              attributes: { exclude: defaultExcludeFields },
              model: OrderItems,
              as: 'orderItems',
              include: [
                {
                  attributes: { exclude: defaultExcludeFields },
                  model: Products,
                  as: 'product',
                  include: [
                    { model: Sizes, as: 'size', attributes: { exclude: defaultExcludeFields } },
                    {
                      model: Brands,
                      as: 'brand',
                      attributes: { exclude: defaultExcludeFields }
                    }
                  ]
                }
              ]
            }
          ],
          order: [['createdAt', 'DESC']]
        };
      },
      byCountry(countryId) {
        return {
          where: { countryId: countryId || null }
        };
      }
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(SalesOrders, []);

SalesOrders.prototype.getItemQuantity = async function() {
  try {
    const count = await OrderItems.count({ where: { salesOrderId: this.id } });
    this.setDataValue('itemQuantity', count);
  } catch (e) {
    throw e;
  }
};

SalesOrders.prototype.checkHasReviewed = async function() {
  try {
    const review = await Reviews.findOne({ where: { orderId: this.id } });
    this.setDataValue('hasReviewed', review !== null);
  } catch (e) {
    throw e;
  }
};

SalesOrders.prototype.getExtraFields = async function() {
  try {
    await this.checkHasReviewed();
    await this.getItemQuantity();
  } catch (e) {
    throw e;
  }
};

export { SalesOrders };
export default SalesOrders;
