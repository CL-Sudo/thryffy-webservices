module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('products', 'is_published', {
      type: Sequelize.BOOLEAN,
      after: 'markup_price',
      defaultValue: true
    }),

  down: async queryInterface => queryInterface.removeColumn('products', 'is_verified')
};
