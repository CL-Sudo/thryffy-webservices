module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'username', {
      type: Sequelize.STRING(100),
      after: 'id'
    }),

  down: () => Promise.resolve()
};
