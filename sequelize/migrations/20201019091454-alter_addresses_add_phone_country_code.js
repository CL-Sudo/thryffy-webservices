module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('addresses', 'phone_country_code', {
      type: Sequelize.STRING(5),
      after: 'name'
    }),

  down: async () => Promise.resolve()
};
