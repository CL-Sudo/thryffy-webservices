module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('sales_orders', 'commission_paid_at', {
      type: Sequelize.DATE,
      after: 'is_commission_paid'
    }),

  down: async () => Promise.resolve()
};
