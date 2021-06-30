module.exports = {
  up: queryInterface => queryInterface.removeColumn('reviews', 'user_id'),

  down: () => Promise.resolve()
};
