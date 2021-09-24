import { foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     */
    return queryInterface.addColumn('notification_topics', 'country_id', {
      ...foreignKey('country_id', 'countries', { onDelete: 'SET NULL' }),
      after: 'id'
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return Promise.resolve();
  }
};
