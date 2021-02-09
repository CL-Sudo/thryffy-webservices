module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'has_valid_subscription', {
      type: Sequelize.BOOLEAN,
      after: 'last_login',
      defaultValue: false
    }),

  down: () => Promise.resolve()
};
