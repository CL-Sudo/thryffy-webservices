module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'identity_type', {
      type: Sequelize.STRING(30),
      after: 'identity_no'
    }),
  down: () => Promise.resolve()
};
