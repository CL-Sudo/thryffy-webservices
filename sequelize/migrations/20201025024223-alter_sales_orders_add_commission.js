module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('sales_orders', 'commission', {
      type: Sequelize.DECIMAL(10, 2),
      after: 'total'
    }),

  down: () => Promise.resolve()
};
