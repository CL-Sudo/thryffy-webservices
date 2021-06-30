module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.removeColumn('favourite_products', 'id'),

  down: () => Promise.resolve()
};
