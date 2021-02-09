module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.removeColumn('users', 'identity_type'),
  down: () => Promise.resolve()
};
