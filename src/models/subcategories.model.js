import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const Subcategories = SequelizeConnector.define(
  'Subcategories',
  {
    id: primaryKey,
    title: {
      type: Sequelize.STRING(100)
    },
    description: {
      type: Sequelize.TEXT
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'subcategories',
    underscored: false,
    scopes: {
      search: params => search(Subcategories, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Subcategories, []);

export { Subcategories };
export default Subcategories;
