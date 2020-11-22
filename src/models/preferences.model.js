import { SequelizeConnector } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const Preferences = SequelizeConnector.define(
  'Preferences',
  {
    categoryId: foreignKey('category_id', 'categories', false),
    userId: foreignKey('user_id', 'users', false),
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    indexes: [{ fields: ['categoryId', 'userId'], unique: true }],
    tableName: 'preferences',
    underscored: false,
    scopes: {
      search: params => search(Preferences, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Preferences, []);

export { Preferences };
export default Preferences;
