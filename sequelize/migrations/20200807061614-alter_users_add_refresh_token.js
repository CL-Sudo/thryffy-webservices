module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'refresh_token', {
      type: Sequelize.STRING,
      after: 'active'
    }),

  down: () => Promise.resolve()
};
