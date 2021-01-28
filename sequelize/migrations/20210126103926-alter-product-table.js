module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('products', 'is_verify', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      after: 'is_purchased'
    }),
  down: () => Promise.resolve()
};
