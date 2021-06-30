module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'identity_type', {
      type: Sequelize.STRING(40),
      after: 'id'
    }),

  down: () => Promise.resolve()
};
