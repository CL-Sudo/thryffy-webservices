module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.renameColumn('sales_orders', 'grand_total', 'total'),

  down: () => Promise.resolve()
};
