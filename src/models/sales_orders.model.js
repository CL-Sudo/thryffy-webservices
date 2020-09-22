import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';
import { PAYMENT_STATUS, DELIVERY_STATUS } from '@constants';
import { OrderItems, Users, Products, Addresses } from '@models';
import R from 'ramda';
import { Op } from 'sequelize';

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
    shippingFee: {
      type: Sequelize.DECIMAL(10, 2),
      field: 'shipping_fee'
    },
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
              attributes: ['id', 'salesOrderId', 'productId'],
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
                      attributes: ['id', 'fullName', 'profilePicture']
                    }
                  ]
                }
              ]
            },
            {
              model: Addresses,
              as: 'address'
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
          attributes: ['id', 'total', 'deliveryStatus', 'createdAt', 'updatedAt'],
          where,
          include: [
            {
              attributes: ['id', 'salesOrderId', 'productId'],
              model: OrderItems,
              as: 'orderItems',
              include: [
                {
                  attributes: ['id', 'title', 'thumbnail'],
                  model: Products,
                  as: 'product'
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
          attributes: ['id', 'total', 'deliveryStatus', 'createdAt', 'updatedAt'],
          include: [
            {
              attributes: ['id', 'salesOrderId', 'productId'],
              model: OrderItems,
              as: 'orderItems',
              include: [
                {
                  attributes: ['id', 'title', 'thumbnail'],
                  model: Products,
                  as: 'product'
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

export { SalesOrders };
export default SalesOrders;
