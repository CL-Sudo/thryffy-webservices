import { foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return queryInterface.addColumn('sales_orders', 'pickup_address_id', {
      ...foreignKey('pickup_address_id', 'addresses', { allowNull: true }),
      after: 'address_id'
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return queryInterface.removeColumn('sales_orders', 'pickup_address_id');
  }
};
