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
  Commissions,
  ShippingFees,
  Reviews
} from '@models';
import R from 'ramda';
import { Op } from 'sequelize';
import { getProductCommission } from '@services/product.service';

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
    userId: foreignKey('user_id', 'users', false),
    addressId: foreignKey('address_id', 'addresses', false),
    orderRef: {
      type: Sequelize.STRING(20),
      field: 'order_ref'
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
      field: 'delivery_status'
    },
    deliveryTrackingNo: {
      type: Sequelize.TEXT,
      field: 'delivery_tracking_no'
    },
    subTotal: {
      type: Sequelize.DECIMAL(10, 2),
      field: 'sub_total'
    },
    shippingFeeId: foreignKey('shipping_fee_id', 'shipping_fees', false),
    tax: {
      type: Sequelize.DECIMAL(10, 2)
    },
    total: {
      type: Sequelize.DECIMAL(10, 2)
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
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'sales_orders',
    underscored: false,
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
                          'otp',
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
                    {
                      model: Brands,
                      as: 'brand',
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
                    }
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
          userId
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

SalesOrders.prototype.getCommission = async function() {
  try {
    const items = await OrderItems.findAll({
      where: { salesOrderId: this.id },
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

    return commission;
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
    await this.getCommission();
    await this.getItemQuantity();
  } catch (e) {
    throw e;
  }
};

export { SalesOrders };
export default SalesOrders;
