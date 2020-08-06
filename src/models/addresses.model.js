import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const Addresses = SequelizeConnector.define(
  'Addresses',
  {
    id: primaryKey,
    userId: foreignKey('user_id', 'users', false),
    title: {
      type: Sequelize.STRING(100)
    },
    addressLine1: {
      type: Sequelize.STRING(150),
      field: 'address_line_1'
    },
    addressLine2: {
      type: Sequelize.STRING(150),
      field: 'address_line_2'
    },
    city: {
      type: Sequelize.STRING(100)
    },
    state: {
      type: Sequelize.STRING(100)
    },
    postcode: {
      type: Sequelize.STRING(100)
    },
    isDefault: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      field: 'is_default'
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'addresses',
    underscored: false,
    scopes: {
      search: params => search(Addresses, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Addresses, []);

export { Addresses };
export default Addresses;
