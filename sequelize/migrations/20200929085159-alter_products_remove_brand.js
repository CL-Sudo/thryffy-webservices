module.exports = {
  up: queryInterface => queryInterface.removeColumn('products', 'brand'),

  down: () => Promise.resolve()
};
