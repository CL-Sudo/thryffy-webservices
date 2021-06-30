module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('sales_orders', 'sub_total', {
      type: Sequelize.DECIMAL(10, 2),
      after: 'delivery_tracking_no'
    }),

  down: () => Promise.resolve()
};
