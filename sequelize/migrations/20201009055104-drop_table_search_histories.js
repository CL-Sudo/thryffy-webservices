module.exports = {
  up: async queryInterface => queryInterface.dropTable('search_histories'),

  down: async () => Promise.resolve()
};
