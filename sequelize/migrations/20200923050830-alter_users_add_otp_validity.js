module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'otp_validity', {
      type: Sequelize.DATE,
      after: 'otp'
    }),

  down: () => Promise.resolve()
};
