module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('admins', 'role', {
      type: Sequelize.STRING(30),
      after: 'id',
      allowedNull: false
    }),

  down: async () => Promise.resolve()
};
