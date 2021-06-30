module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('reviews', 'comment', {
      type: Sequelize.TEXT,
      after: 'rating'
    }),

  down: () => Promise.resolve()
};
