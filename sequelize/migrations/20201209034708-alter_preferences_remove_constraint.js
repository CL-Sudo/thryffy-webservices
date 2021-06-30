import { foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('preferences', 'user_id');
      await queryInterface.addColumn('preferences', 'user_id', {
        ...foreignKey('user_id', 'users', false),
        after: 'preferable_type'
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('preferences', 'user_id');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
