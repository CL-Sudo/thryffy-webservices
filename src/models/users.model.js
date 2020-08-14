import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey, active } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';
import { hashPassword, comparePassword } from '@tools/bcrypt';

const Users = SequelizeConnector.define(
  'Users',
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
      type: Sequelize.STRING
    },
    firstName: {
      type: Sequelize.STRING(100),
      field: 'first_name'
    },
    lastName: {
      type: Sequelize.STRING(100),
      field: 'last_name'
    },
    phoneCountryCode: {
      type: Sequelize.STRING(5),
      field: 'phone_country_code'
    },
    phoneNumber: {
      type: Sequelize.STRING(25),
      field: 'phone_number'
    },
    facebookId: {
      type: Sequelize.STRING,
      field: 'facebook_id'
    },
    googleId: {
      type: Sequelize.STRING,
      field: 'google_id'
    },
    profilePicture: {
      type: Sequelize.STRING,
      field: 'profile_picture'
    },
    tac: {
      type: Sequelize.STRING(20)
    },
    isVerified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      field: 'is_verified'
    },
    active,
    refreshToken: {
      type: Sequelize.STRING,
      field: 'refresh_token'
    },
    loginFrequency: {
      type: Sequelize.INTEGER,
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
    tableName: 'users',
    underscored: false,
    defaultScope: { attributes: { exclude: ['password'] } },
    scopes: {
      search: params => search(Users, params, [])
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

addScopesByAllFields(Users, []);

Users.prototype.comparePassword = async function(password) {
  const match = await comparePassword(password, this.password);
  return match;
};

export { Users };
export default Users;
