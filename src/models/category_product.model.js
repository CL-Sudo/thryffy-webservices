import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, foreignKey, defaultExcludeFields } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';
import { SequelizeConnector } from '@configs/sequelize-connector.config';

const CategoryProduct = SequelizeConnector.define(
  'CategoryProduct',
  {
    categoryId: {
      ...foreignKey('category_id', 'categories', false)
    },
    productId: {
      ...foreignKey('product_id', 'products', false)
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    indexes: [{ fields: ['category_id', 'product_id'], unique: true }],
    tableName: 'category_product',
    defaultScope: {
      attributes: {
        exclude: defaultExcludeFields
      }
    },
    underscored: false,
    scopes: {
      search: params => search(CategoryProduct, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(CategoryProduct, []);

export { CategoryProduct };
export default CategoryProduct;
