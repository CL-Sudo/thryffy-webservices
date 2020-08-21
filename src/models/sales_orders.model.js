import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';
import { PAYMENT_STATUS } from '@constants';
import { OrderItems, Users, Products, Addresses } from '@models';

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
      type: Sequelize.DECIMAL(10, 2),
      field: 'total'
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
                      attributes: ['id', 'fullName', 'firstName', 'lastName', 'profilePicture']
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
