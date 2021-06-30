module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('categories', 'default', {
      type: Sequelize.STRING(30),
      after: 'shipping_fee_id'
    }),

  down: async () => Promise.resolve()
};
