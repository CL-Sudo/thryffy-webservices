module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('products', 'sold_at', {
      type: Sequelize.DATE,
      after: 'view_count'
    }),
  down: () => Promise.resolve()
};
