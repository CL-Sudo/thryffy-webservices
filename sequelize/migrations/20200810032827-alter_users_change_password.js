module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING
    }),

  down: () => Promise.resolve()
};
