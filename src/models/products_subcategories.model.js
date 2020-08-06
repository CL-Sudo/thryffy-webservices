import { SequelizeConnector } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const ProductsSubcategories = SequelizeConnector.define(
  'ProductsSubcategories',
  {
    productId: foreignKey('product_id', 'products', false),
    subcategoryId: foreignKey('subcategory_id', 'subcategories', false),
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'products_subcategories',
    underscored: false,
    scopes: {
      search: params => search(ProductsSubcategories, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(ProductsSubcategories, []);

export { ProductsSubcategories };
export default ProductsSubcategories;
