import { Admins, Countries } from '@models';
import ROLE from '@constants/admin.constant';

const { COUNTRIES } = require('../../src/constants/countries.constant');

module.exports = {
  up: async queryInterface => {
    return queryInterface.sequelize.transaction(async transaction => {
      const brunei = await Countries.findOne({ where: { code: COUNTRIES.BRUNEI.CODE } });
      await Admins.create(
        {
          countryId: brunei.id,
          username: 'admin.bn.01',
          email: 'admin.bn.01@test.com',
          password: '1234',
          role: ROLE.OPERATOR
        },
        { transaction }
      );

      await Admins.create(
        {
          countryId: brunei.id,
          username: 'superadmin.bn.01',
          email: 'superadmin.bn.01@test.com',
          password: '1234',
          role: ROLE.SUPER_ADMIN
        },
        { transaction }
      );
    });
  },

  down: async () => {
    return Promise.resolve();
  }
};
