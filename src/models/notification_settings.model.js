import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const NotificationSettings = SequelizeConnector.define(
  'NotificationSettings',
  {
    id: primaryKey,
    userId: foreignKey('user_id', 'users', { allowNull: false, onDelete: 'CASCADE' }),
    isOrderAllowed: {
      type: Sequelize.BOOLEAN,
      field: 'is_order_allowed',
      defaultValue: true
    },
    isPromotionAllowed: {
      type: Sequelize.BOOLEAN,
      field: 'is_promotion_allowed',
      defaultValue: true
    },
    isReminderAllowed: {
      type: Sequelize.BOOLEAN,
      field: 'is_reminder_allowed',
      defaultValue: true
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'notification_settings',
    scopes: {
      search: params => search(NotificationSettings, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(NotificationSettings, []);

export { NotificationSettings };
export default NotificationSettings;
