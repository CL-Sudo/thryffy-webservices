module.exports = {
  up: async queryInterface => {
    try {
      await queryInterface.removeColumn('sizes', 'category_id');
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  down: () => Promise.resolve()
};
