module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('conditions', 'description', {
      type: Sequelize.STRING,
      after: 'title'
    }),

  down: () => Promise.resolve()
};
