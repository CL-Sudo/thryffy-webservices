import { Admins } from '@models';
import ROLE from '@constants/admin.constant';

module.exports = {
  up: async () => {
    try {
      await Admins.create({
        id: 1,
        username: 'superadmin',
        email: 'superadmin@test.com',
        password: '1234',
        role: ROLE.SUPER_ADMIN
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async () => Promise.resolve()
};
