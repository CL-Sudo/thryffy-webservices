import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const Subscriptions = SequelizeConnector.define(
  'Subscriptions',
  {
    id: primaryKey,
    userId: foreignKey('user_id', 'users', false),
    packageId: foreignKey('package_id', 'packages', false),
    listingCount: {
      type: Sequelize.INTEGER,
      field: 'listing_count'
    },
    expiryDate: {
      type: Sequelize.DATE,
      field: 'expiry_date'
    },
    reminderCount: {
      type: Sequelize.INTEGER,
      field: 'reminder_count',
      defaultValue: 0
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
