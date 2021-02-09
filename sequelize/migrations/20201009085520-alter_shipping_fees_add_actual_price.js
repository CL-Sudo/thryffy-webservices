module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('shipping_fees', 'actual_price', {
      type: Sequelize.DECIMAL(10, 2),
      after: 'markup_price'
    }),

  down: async () => Promise.resolve()
};
