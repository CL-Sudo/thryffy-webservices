import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const Products = SequelizeConnector.define(
  'Products',
  {
    id: primaryKey,
    userId: foreignKey('user_id', 'users', false),
    categoryId: foreignKey('category_id', 'categories', false),
    title: {
      type: Sequelize.STRING(100)
    },
    description: {
      type: Sequelize.TEXT
    },
    thumbnail: {
      type: Sequelize.STRING
    },
    price: {
      type: Sequelize.DECIMAL(10, 2)
    },
    condition: {
      type: Sequelize.STRING(50)
    },
    size: {
      type: Sequelize.STRING(50)
    },
    brand: {
      type: Sequelize.STRING(100)
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'products',
    underscored: false,
    scopes: {
      search: params => search(Products, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Products, []);

export { Products };
export default Products;
