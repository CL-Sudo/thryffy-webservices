module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'is_verified', {
      type: Sequelize.BOOLEAN,
      after: 'tac'
    }),

  down: () => Promise.resovle()
};
