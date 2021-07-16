import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('delivery_slips', {
      id: primaryKey,
      orderId: foreignKey('order_id', 'sales_orders', {
        onDelete: 'CASCADE',
        allowNull: false
      }),
      path: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    return queryInterface.dropTable('delivery_slips');
  }
};
