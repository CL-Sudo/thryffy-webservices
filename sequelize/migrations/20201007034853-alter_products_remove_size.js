module.exports = {
  up: async queryInterface => queryInterface.removeColumn('products', 'size'),

  down: async () => Promise.resolve()
};
