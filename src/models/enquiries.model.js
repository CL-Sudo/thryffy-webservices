import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const Enquiries = SequelizeConnector.define(
  'Enquiries',
  {
    id: primaryKey,
    userId: foreignKey('user_id', 'users', false),
    type: {
      type: Sequelize.STRING,
      allowNull: false
    },
    subject: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.STRING(250)
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'enquiries',
    underscored: false,
    scopes: {
      search: params => search(Enquiries, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Enquiries, []);

export { Enquiries };
export default Enquiries;
