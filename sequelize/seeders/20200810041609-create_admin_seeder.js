import { Admins } from '@models';

module.exports = {
  up: async () => {
    try {
      await Admins.create({
        email: 'admin@test.com',
        password: '1234'
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: queryInterface => queryInterface.bulkDelete('admins')
};
