module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'full_name', {
      type: Sequelize.STRING(150),
      after: 'last_name'
    }),

  down: () => Promise.resolve()
};
