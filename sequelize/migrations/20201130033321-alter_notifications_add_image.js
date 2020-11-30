module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('notifications', 'image', {
      type: Sequelize.STRING,
      after: 'description'
    }),

  down: async () => Promise.resolve()
};
