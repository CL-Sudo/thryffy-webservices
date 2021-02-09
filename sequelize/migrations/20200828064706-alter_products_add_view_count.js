module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('products', 'view_count', {
      type: Sequelize.INTEGER,
      after: 'brand'
    }),

  down: () => Promise.resolve()
};
