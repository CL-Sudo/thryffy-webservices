module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('sizes', 'age', {
        type: Sequelize.STRING(50),
        after: 'waist_size'
      });

      await queryInterface.addColumn('sizes', 'height', {
        type: Sequelize.STRING(50),
        after: 'age'
      });

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async () => Promise.resolve()
};
