import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';
import { hashPassword, comparePassword } from '@tools/bcrypt';

const Admins = SequelizeConnector.define(
  'Admins',
  {
    id: primaryKey,
    email: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    firstName: {
      type: Sequelize.STRING,
      field: 'first_name'
    },
    lastName: {
      type: Sequelize.STRING,
      field: 'last_name'
    },
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    loginFrequency: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      field: 'login_frequency'
    },
    lastLogin: {
      type: Sequelize.DATE,
      field: 'last_login'
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'admins',
    underscored: false,
    defaultScope: { attributes: { exclude: ['password'] } },
    scopes: {
      search: params => search(Admins, params, [])
      // attributes: { exclude: ['password'] }
    },
    hooks: {
      beforeCreate: async user => {
        if (user.password) {
          user.password = hashPassword(user.password);
        }
      },
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Admins, []);

Admins.prototype.comparePassword = async function(password) {
  const match = await comparePassword(password, this.password);
  return match;
};

export { Admins };
export default Admins;
