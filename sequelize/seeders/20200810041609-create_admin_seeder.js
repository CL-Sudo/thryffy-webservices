import { Admins } from '@models';
import ROLE from '@constants/admin.constant';

module.exports = {
  up: async () => {
    try {
      await Admins.create({
        id: 2,
        username: 'admin01',
        email: 'admin@test.com',
        password: '1234',
        role: ROLE.OPERATOR
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: queryInterface => queryInterface.bulkDelete('admins')
};
