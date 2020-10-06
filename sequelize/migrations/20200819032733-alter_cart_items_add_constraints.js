module.exports = {
  up: async queryInterface => {
    try {
      await queryInterface.removeColumn('cart_items', 'id');
      await queryInterface.addConstraint('cart_items', {
        type: 'unique',
        fields: ['product_id', 'user_id']
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: () => Promise.resolve()
};
