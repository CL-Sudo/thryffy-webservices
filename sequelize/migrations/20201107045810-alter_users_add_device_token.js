module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'device_token', {
      type: Sequelize.STRING,
      after: 'google_id'
    }),

  down: async () => Promise.resolve()
};
