module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.removeColumn('sizes', 'default'),

  down: async () => Promise.resolve()
};
