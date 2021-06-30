import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';
import { SequelizeConnector } from '@configs/sequelize-connector.config';

const FavouriteProducts = SequelizeConnector.define(
  'FavouriteProducts',
  {
    productId: foreignKey('product_id', 'products', { onDelete: 'CASCADE' }),
    userId: foreignKey('user_id', 'users', { onDelete: 'CASCADE' }),
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    indexes: [{ fields: ['productId', 'userId'], unique: true }],
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
