import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, foreignKey, primaryKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const Reviews = SequelizeConnector.define(
  'Reviews',
  {
    id: primaryKey,
    userId: foreignKey('user_id', 'users', false),
    orderItemId: foreignKey('order_item_id', 'order_items', false),
    rating: {
      type: Sequelize.INTEGER
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'reviews',
    underscored: false,
    scopes: {
      search: params => search(Reviews, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Reviews, []);

export { Reviews };
export default Reviews;
