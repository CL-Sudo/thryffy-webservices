module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.changeColumn('sales_orders', 'courier', {
      type: Sequelize.STRING(30),
      after: 'payment_method'
    }),

  down: () => Promise.resolve()
};
