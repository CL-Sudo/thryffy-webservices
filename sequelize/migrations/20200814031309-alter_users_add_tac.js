module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'tac', {
      type: Sequelize.STRING(20),
      after: 'profile_picture'
    }),

  down: () => Promise.resolve()
};
