import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const NotificationTopics = SequelizeConnector.define(
  'NotificationTopics',
  {
    id: primaryKey,
    countryId: foreignKey('country_id', 'countries', { onDelete: 'SET NULL' }),
    title: {
      type: Sequelize.STRING(50)
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'notification_topics',
    scopes: {
      search: params => search(NotificationTopics, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(NotificationTopics, []);

export { NotificationTopics };
export default NotificationTopics;
