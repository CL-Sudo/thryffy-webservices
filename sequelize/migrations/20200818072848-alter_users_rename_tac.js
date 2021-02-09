module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.renameColumn('users', 'tac', 'otp'),

  down: () => Promise.resolve()
};
