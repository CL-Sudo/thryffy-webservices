module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('notifications', 'notifiable_id', {
        type: Sequelize.INTEGER.UNSIGNED,
        after: 'actor_id'
      });

      await queryInterface.addColumn('notifications', 'notifiable_type', {
        type: Sequelize.STRING(30),
        after: 'notifiable_id'
      });

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async () => Promise.resolve()
};
