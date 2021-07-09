/* eslint-disable arrow-body-style */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('sales_orders', 'delivery_slip', {
      type: Sequelize.TEXT,
      after: 'delivery_tracking_no'
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
