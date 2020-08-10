module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('admins', 'active', {
      type: Sequelize.BOOLEAN,
      after: 'last_name'
    }),

  down: () => Promise.resolve()
};
