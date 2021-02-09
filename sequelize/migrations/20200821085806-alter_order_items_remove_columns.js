module.exports = {
  up: async queryInterface => {
    await queryInterface.removeColumn('order_items', 'item_name');
    await queryInterface.removeColumn('order_items', 'price');
  },

  down: () => Promise.resolve()
};
