module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('subscriptions', 'reminder_count', {
      type: Sequelize.INTEGER,
      after: 'expiry_date',
      defaultValue: 0
    }),

  down: () => Promise.resolve()
};
