module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // await queryInterface.removeConstraint('preferences', 'preferences_category_id_user_id_uk');
      await queryInterface.removeColumn('preferences', 'category_id');
      await queryInterface.addColumn('preferences', 'preferable_id', {
        type: Sequelize.INTEGER,
        after: 'user_id'
      });
      await queryInterface.addColumn('preferences', 'preferable_type', {
        type: Sequelize.STRING(50),
        after: 'preferable_id'
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: () => Promise.resolve()
};
