module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('products', 'original_price', {
        type: Sequelize.DECIMAL(10, 2),
        after: 'thumbnail'
      });
      await queryInterface.addColumn('products', 'markup_price', {
        type: Sequelize.DECIMAL(10, 2),
        after: 'original_price'
      });
      await queryInterface.removeColumn('products', 'price');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async queryInterface => {
    try {
      await queryInterface.removeColumn('products', 'original_price');
      await queryInterface.removeColumn('products', 'markup_price');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
