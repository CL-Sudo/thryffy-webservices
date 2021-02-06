module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('sales_orders', 'shipped_at', {
      type: Sequelize.DATE,
      after: 'has_seller_dispute'
    }),

  down: () => Promise.resolve()
};
