import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const Countries = SequelizeConnector.define(
  'Countries',
  {
    id: primaryKey,
    name: {
      type: Sequelize.STRING(100)
    },
    code: {
      type: Sequelize.STRING(3)
    },
    flag: {
      type: Sequelize.TEXT
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'countries',
    underscored: false,
    scopes: {
      search: params => search(Countries, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Countries, []);

export { Countries };
export default Countries;
