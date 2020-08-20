module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('addresses', 'name', {
      type: Sequelize.STRING(100),
      after: 'user_id'
    }),

  down: () => Promise.resolve()
};
