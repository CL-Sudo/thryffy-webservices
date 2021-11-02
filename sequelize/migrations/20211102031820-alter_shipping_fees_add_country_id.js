import { foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('shipping_fees', 'country_id', {
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
  }
};
