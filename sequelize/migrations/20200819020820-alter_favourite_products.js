module.exports = {
  up: queryInterface =>
    queryInterface.addConstraint('favourite_products', {
      fields: ['product_id', 'user_id'],
      type: 'unique'
    }),

  down: () => Promise.resolve()
};
