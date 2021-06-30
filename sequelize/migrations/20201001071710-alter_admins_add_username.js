module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('admins', 'username', {
      type: Sequelize.STRING,
      after: 'id'
    }),

  down: () => Promise.resolve()
};
