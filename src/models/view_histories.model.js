import { SequelizeConnector } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const ViewHistories = SequelizeConnector.define(
  'ViewHistories',
  {
    id: primaryKey,
    productId: foreignKey('product_id', 'products', { onDelete: 'CASCADE' }),
    userId: foreignKey('user_id', 'users', { onDelete: 'CASCADE' }),
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'view_histories',
    scopes: {
      search: params => search(ViewHistories, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(ViewHistories, []);

export { ViewHistories };
export default ViewHistories;
