module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'date_of_birth', {
      type: Sequelize.DATEONLY(),
      after: 'phone_number'
    }),

  down: () => Promise.resolve()
};
