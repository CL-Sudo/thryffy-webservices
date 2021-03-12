import { SequelizeConnector, Sequelize } from '@configs/sequelize-connector.config';
import { addScopesByAllFields, search } from '@utils/sequelize-scopes.util';
import { AT_RECORDER, BY_RECORDER, primaryKey } from '@constants/sequelize.constant';
import { parseParanoidToIncludes } from '@utils/sequelize-hooks.util';

const Otps = SequelizeConnector.define(
  'Otps',
  {
    id: primaryKey,
    phoneCountryCode: {
      type: Sequelize.STRING(5),
      field: 'phone_country_code',
      allowNull: false
    },
    phoneNumber: {
      type: Sequelize.STRING(25),
      field: 'phone_number',
      allowNull: false
    },
    otp: {
      type: Sequelize.STRING(25),
      allowNull: false
    },
    otpValidity: {
      type: Sequelize.DATE,
      field: 'otp_validity',
      allowNull: false
    },
    isVerified: {
      type: Sequelize.BOOLEAN,
      field: 'is_verified',
      defaultValue: false
    },
    ...AT_RECORDER,
    ...BY_RECORDER
  },
  {
    tableName: 'otps',
    underscored: false,
    scopes: {
      search: params => search(Otps, params, [])
    },
    hooks: {
      beforeFind: query => {
        parseParanoidToIncludes(query);
      }
    }
  }
);

addScopesByAllFields(Otps, []);

export { Otps };
export default Otps;
