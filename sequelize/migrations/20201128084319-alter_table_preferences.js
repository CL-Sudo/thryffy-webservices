module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.changeColumn('preferences', 'preferable_type', {
      type: Sequelize.STRING(50),
      after: 'preferable_id'
    }),

  down: async () => Promise.resolve()
};
