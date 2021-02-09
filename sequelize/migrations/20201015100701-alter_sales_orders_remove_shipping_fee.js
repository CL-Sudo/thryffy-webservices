module.exports = {
  up: async queryInterface => queryInterface.removeColumn('sales_orders', 'shipping_fee'),

  down: () => Promise.resolve()
};
