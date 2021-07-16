import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const DeliverySlips = SequelizeConnector.define(
  'DeliverySlips',
  {
    id: primaryKey,
    orderId: foreignKey('order_id', 'sales_orders'),
    path: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'delivery_slips',
    underscored: false,
    scopes: {
      search: params => search(DeliverySlips, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(DeliverySlips, []);

export { DeliverySlips };
export default DeliverySlips;
