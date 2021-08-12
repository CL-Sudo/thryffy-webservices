import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

import moment from 'moment';

const Subscriptions = SequelizeConnector.define(
  'Subscriptions',
  {
    id: primaryKey,
    userId: foreignKey('user_id', 'users', { onDelete: 'CASCADE' }),
    packageId: foreignKey('package_id', 'packages', false),
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

Subscriptions.prototype.checkHasValidSubscription = function() {
  const now = moment();
  const diff = now.diff(this.expiryDate, 'seconds');

  const isSubscriptionValid = diff <= 0;

  return isSubscriptionValid;
};

export { Subscriptions };
export default Subscriptions;
