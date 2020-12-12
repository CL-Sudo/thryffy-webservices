import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

import { Users } from '@models/users.model';

import moment from 'moment';

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
      },
      afterCreate: async subscription => {
        try {
          const user = await Users.findOne({ where: { id: subscription.userId } });
          const hasValidSubscription = await subscription.checkHasValidSubscription();
          await user.update({
            hasValidSubscription
          });
        } catch (e) {
          throw e;
        }
      },
      afterUpdate: async subscription => {
        try {
          const user = await Users.findOne({ where: { id: subscription.userId } });
          const hasValidSubscription = await subscription.checkHasValidSubscription();
          await user.update({
            hasValidSubscription
          });
        } catch (e) {
          throw e;
        }
      }
    }
  }
);

addScopesByAllFields(Subscriptions, []);

Subscriptions.prototype.checkHasValidSubscription = async function() {
  try {
    const now = moment();
    const diff = now.diff(this.expiryDate, 'seconds');
    return diff <= 0;
  } catch (e) {
    throw e;
  }
};

export { Subscriptions };
export default Subscriptions;
