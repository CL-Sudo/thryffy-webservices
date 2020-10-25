module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('sales_orders', 'is_commission_paid', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      after: 'total'
    }),

  down: async queryInterface => queryInterface.removeColumn('sales_orders', 'is_commission_paid')
};
