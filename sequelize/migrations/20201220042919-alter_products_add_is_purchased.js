module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('products', 'is_purchased', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        after: 'is_published'
      });

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: () => Promise.resolve()
};
