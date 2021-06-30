module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('addresses', 'phone_number', {
      type: Sequelize.STRING(25),
      after: 'user_id'
    }),

  down: () => Promise.resolve()
};
