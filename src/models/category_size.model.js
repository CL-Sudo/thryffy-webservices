import { SequelizeConnector } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const CategorySize = SequelizeConnector.define(
  'CategorySize',
  {
    categoryId: foreignKey('category_id', 'categories', false),
    sizeId: foreignKey('size_id', 'sizes', false),
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    indexes: [{ fields: ['categoryId', 'sizeId'], unique: true }],
    tableName: 'category_size',
    underscored: false,
    scopes: {
      search: params => search(CategorySize, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(CategorySize, []);

export { CategorySize };
export default CategorySize;
