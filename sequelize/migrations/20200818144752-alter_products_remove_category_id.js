module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.removeColumn('products', 'category_id'),

  down: () => Promise.resolve()
};
