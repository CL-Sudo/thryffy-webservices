import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const Subscriptions = SequelizeConnector.define(
  'Subscriptions',
  {
    id: primaryKey,
    title: {
      type: Sequelize.STRING(100)
    },
    description: {
      type: Sequelize.TEXT
    },
    price: {
      type: Sequelize.DECIMAL(10, 2)
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'subscriptions',
    underscored: false,
    scopes: {
      search: params => search(Subscriptions, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Subscriptions, []);

export { Subscriptions };
export default Subscriptions;
