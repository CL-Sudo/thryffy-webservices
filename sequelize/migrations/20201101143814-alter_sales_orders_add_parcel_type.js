module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('sales_orders', 'parcel_type', {
      type: Sequelize.STRING(20),
      after: 'order_ref'
    }),

  down: () => Promise.resolve()
};
