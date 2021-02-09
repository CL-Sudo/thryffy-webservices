module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('shipping_fees', 'type', {
      type: Sequelize.STRING(50),
      after: 'markup_price'
    }),
  down: () => Promise.resolve()
};
