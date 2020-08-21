import { SequelizeConnector } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const OrderItems = SequelizeConnector.define(
  'OrderItems',
  {
    id: primaryKey,
    salesOrderId: foreignKey('sales_order_id', 'sales_orders', false),
    productId: foreignKey('product_id', 'products', false),
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'order_items',
    underscored: false,
    scopes: {
      search: params => search(OrderItems, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(OrderItems, []);

export { OrderItems };
export default OrderItems;
