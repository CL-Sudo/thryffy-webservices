module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.changeColumn('notifications', 'type', {
      type: Sequelize.STRING(80),
      after: 'is_read'
    }),

  down: () => Promise.resolve()
};
