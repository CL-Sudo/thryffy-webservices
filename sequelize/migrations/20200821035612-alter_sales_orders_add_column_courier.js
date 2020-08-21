module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('sales_orders', 'courier', {
      type: Sequelize.STRING(50),
      after: 'payment_method'
    });

    await queryInterface.addColumn('sales_orders', 'shipping_fee', {
      type: Sequelize.DECIMAL(10, 2),
      after: 'delivery_tracking_no'
    });

    await queryInterface.addColumn('sales_orders', 'tax', {
      type: Sequelize.DECIMAL(10, 2),
      after: 'shipping_fee'
    });
  },
  down: queryInterface => queryInterface.removeColumn('sales_orders', 'courier')
};
