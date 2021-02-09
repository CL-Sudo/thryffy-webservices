module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('reviews', 'seller_id', {
      type: Sequelize.INTEGER.UNSIGNED,
      after: 'id'
    }),
  down: () => Promise.resolve()
};
