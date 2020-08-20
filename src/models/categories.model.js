import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey, defaultExcludeFields } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const Categories = SequelizeConnector.define(
  'Categories',
  {
    id: primaryKey,
    parentId: {
      ...foreignKey('parent_id', 'categories', { onDelete: 'CASCADE' }),
      defaultValue: null
    },
    title: {
      type: Sequelize.STRING(100)
    },
    description: {
      type: Sequelize.TEXT
    },
    thumbnail: {
      type: Sequelize.STRING
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'categories',
    underscored: false,
    defaultScope: {
      attributes: {
        exclude: defaultExcludeFields
      }
    },
    scopes: {
      search: params => search(Categories, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Categories, []);

export { Categories };
export default Categories;
