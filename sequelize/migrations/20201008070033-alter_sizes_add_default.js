module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('sizes', 'default', {
      type: Sequelize.STRING(30),
      after: 'type'
    }),

  down: async () => Promise.resolve()
};
