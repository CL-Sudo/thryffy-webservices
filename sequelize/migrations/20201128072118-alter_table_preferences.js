module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.changeColumn('preferences', 'preferable_id', {
        type: Sequelize.INTEGER,
        after: 'user_id'
      });
      await queryInterface.changeColumn('preferences', 'preferable_type', {
        type: Sequelize.INTEGER,
        after: 'preferable_id'
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async () => Promise.resolve()
};
