import { active } from '@constants/sequelize.constant';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'active', {
      ...active,
      after: 'profile_picture'
    }),

  down: () => Promise.resolve()
};
