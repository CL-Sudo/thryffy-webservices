import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, foreignKey, primaryKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const Reviews = SequelizeConnector.define(
  'Reviews',
  {
    id: primaryKey,
    sellerId: {
      type: Sequelize.INTEGER.UNSIGNED,
      field: 'seller_id',
      allowNull: false
    },
    orderId: foreignKey('order_id', 'sales_orders', false),
    rating: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    comment: {
      type: Sequelize.TEXT
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
