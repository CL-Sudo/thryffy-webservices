import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, foreignKey, primaryKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const Disputes = SequelizeConnector.define(
  'Disputes',
  {
    id: primaryKey,
    orderId: foreignKey('order_id', 'sales_orders', false),
    title: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING(250)
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'disputes',
    underscored: false,
    scopes: {
      search: params => search(Disputes, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Disputes, []);

export { Disputes };
export default Disputes;
