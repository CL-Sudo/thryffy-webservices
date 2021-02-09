module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('shipping_fees', 'parcel_name', {
      type: Sequelize.STRING(80),
      after: 'actual_price'
    }),

  down: queryInterface => queryInterface.removeColumn('shipping_fees', 'pacel_name')
};
