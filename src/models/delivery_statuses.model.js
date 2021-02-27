import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const DeliveryStatuses = SequelizeConnector.define(
  'DeliveryStatuses',
  {
    id: primaryKey,
    orderId: foreignKey('order_id', 'sales_orders'),
    trackingmorePayload: {
      type: Sequelize.TEXT,
      field: 'trackingmore_payload'
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'delivery_statuses',
    underscored: false,
    scopes: {
      search: params => search(DeliveryStatuses, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(DeliveryStatuses, []);

export { DeliveryStatuses };
export default DeliveryStatuses;
