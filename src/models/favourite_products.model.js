import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, foreignKey, primaryKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';
import { SequelizeConnector } from '@configs/sequelize-connector.config';

const FavouriteProducts = SequelizeConnector.define(
  'FavouriteProducts',
  {
    id: primaryKey,
    productId: foreignKey('product_id', 'products', false),
    userId: foreignKey('user_id', 'users', false),
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'favourite_products',
    underscored: false,
    scopes: {
      search: params => search(FavouriteProducts, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(FavouriteProducts, []);

export { FavouriteProducts };
export default FavouriteProducts;
