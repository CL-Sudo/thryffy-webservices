module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('subscriptions', 'expiry_date', {
      type: Sequelize.DATE,
      after: 'listing_count'
    }),

  down: async () => Promise.resolve()
};
