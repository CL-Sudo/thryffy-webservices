module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('sales_orders', 'transaction_id', {
      type: Sequelize.STRING(30),
      after: 'address_id'
    }),

  down: () => Promise.resolve()
};
