import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

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
    paymentStatus: {
      type: Sequelize.STRING(50),
      field: 'payment_status'
    },
    deliveryStatus: {
      type: Sequelize.STRING(50),
      field: 'delivery_status'
    },
    deliveryTrackingNo: {
      type: Sequelize.TEXT,
      field: 'delivery_tracking_no'
    },
    grandTotal: {
      type: Sequelize.DECIMAL(10, 2),
      field: 'grand_total'
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'sales_orders',
    underscored: false,
    scopes: {
      search: params => search(SalesOrders, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(SalesOrders, []);

export { SalesOrders };
export default SalesOrders;
