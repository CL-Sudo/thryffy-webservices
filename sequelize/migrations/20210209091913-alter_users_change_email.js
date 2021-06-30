module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING,
      unique: true,
      after: 'username'
    }),

  down: () => Promise.resolve()
};
