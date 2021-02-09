module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'identity_no', {
      type: Sequelize.STRING(50),
      after: 'id'
    }),

  down: queryInterface => queryInterface.addColumn('users', 'identity_no')
};
