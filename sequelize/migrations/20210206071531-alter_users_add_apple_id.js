module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'apple_id', {
      type: Sequelize.STRING,
      after: 'date_of_birth'
    }),

  down: () => Promise.resolve()
};
