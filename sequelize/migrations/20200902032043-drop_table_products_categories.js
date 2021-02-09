module.exports = {
  up: queryInterface => queryInterface.dropTable('category_product'),
  down: () => Promise.resolve()
};
