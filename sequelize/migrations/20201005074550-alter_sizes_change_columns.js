module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.changeColumn('sizes', 'international', {
        type: Sequelize.STRING(30)
      });
      await queryInterface.changeColumn('sizes', 'us', {
        type: Sequelize.STRING(30)
      });
      await queryInterface.changeColumn('sizes', 'uk', {
        type: Sequelize.STRING(30)
      });
      await queryInterface.changeColumn('sizes', 'eu', {
        type: Sequelize.STRING(30)
      });
      await queryInterface.changeColumn('sizes', 'waist_size', {
        type: Sequelize.STRING(30)
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async () => Promise.resolve()
};
