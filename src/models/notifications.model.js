import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const Notifications = SequelizeConnector.define(
  'Notifications',
  {
    id: primaryKey,
    notifierId: foreignKey('notifier_id', 'users', false),
    actorId: foreignKey('actor_id', 'users', false),
    title: {
      type: Sequelize.STRING(200)
    },
    description: {
      type: Sequelize.STRING
    },
    isRead: {
      type: Sequelize.BOOLEAN,
      field: 'is_read',
      defaultValue: false
    },
    type: {
      type: Sequelize.STRING(20)
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'notifications',
    underscored: false,
    scopes: {
      search: params => search(Notifications, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Notifications, []);

export { Notifications };
export default Notifications;
