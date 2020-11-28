import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const Conditions = SequelizeConnector.define(
  'Conditions',
  {
    id: primaryKey,
    title: {
      type: Sequelize.STRING(100)
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'conditions',
    underscored: false,
    scopes: {
      search: params => search(Conditions, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Conditions, []);

export { Conditions };
export default Conditions;
