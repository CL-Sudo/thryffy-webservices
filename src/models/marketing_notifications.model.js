import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const MarketingNotifications = SequelizeConnector.define(
  'MarketingNotifications',
  {
    id: primaryKey,
    title: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    },
    image: {
      type: Sequelize.STRING
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'marketing_notifications',
    scopes: {
      search: params => search(MarketingNotifications, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(MarketingNotifications, []);

export { MarketingNotifications };
export default MarketingNotifications;
