import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const Comments = SequelizeConnector.define(
  'Comments',
  {
    id: primaryKey,
    userId: foreignKey('user_id', 'users', false),
    productId: foreignKey('product_id', 'products', false),
    comment: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'comments',
    underscored: false,
    scopes: {
      search: params => search(Comments, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Comments, []);

export { Comments };
export default Comments;
