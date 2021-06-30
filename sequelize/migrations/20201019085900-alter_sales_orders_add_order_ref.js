module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('sales_orders', 'order_ref', {
      type: Sequelize.STRING(20),
      after: 'address_id'
    }),

  down: async queryInterface => queryInterface.removeColumn('sales_orders', 'order_ref')
};
