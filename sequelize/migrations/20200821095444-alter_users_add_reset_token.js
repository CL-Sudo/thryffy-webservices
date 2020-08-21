module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'reset_token', {
      type: Sequelize.STRING,
      after: 'refresh_token'
    }),

  down: () => Promise.resolve()
};
