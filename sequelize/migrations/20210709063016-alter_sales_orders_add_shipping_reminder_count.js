module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     */
    return queryInterface.addColumn('sales_orders', 'shipping_reminder_count', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      after: 'shipped_at'
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
