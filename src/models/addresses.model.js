import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const Addresses = SequelizeConnector.define(
  'Addresses',
  {
    id: primaryKey,
    userId: foreignKey('user_id', 'users', { onDelete: 'CASCADE' }),
    name: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    phoneCountryCode: {
      type: Sequelize.STRING(5),
      field: 'phone_country_code'
    },
    phoneNumber: {
      type: Sequelize.STRING(25),
      field: 'phone_number'
    },
    title: {
      type: Sequelize.STRING(100)
    },
    addressLine1: {
      type: Sequelize.STRING(150),
      field: 'address_line_1',
      allowNull: false
    },
    addressLine2: {
      type: Sequelize.STRING(150),
      field: 'address_line_2'
    },
    city: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    state: {
      type: Sequelize.STRING(100)
    },
    district: {
      type: Sequelize.STRING(100)
    },
    postcode: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    isDefault: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      field: 'is_default'
    },
    stringified: {
      type: Sequelize.VIRTUAL,
      get() {
        return `${this.get('addressLine1')} ${this.get('addressLine2')}, ${this.get(
          'postcode'
        )}, ${this.get('city')}, ${this.get('state') || this.get('district')}`;
      }
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'addresses',
    underscored: false,
    scopes: {
      search: params => search(Addresses, params, []),
      defaultId(userId) {
        return {
          where: { userId, isDefault: true }
        };
      }
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
