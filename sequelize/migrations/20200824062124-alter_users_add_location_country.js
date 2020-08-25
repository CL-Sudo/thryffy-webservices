module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('users', 'state', {
        type: Sequelize.STRING(100),
        after: 'last_name'
      });
      await queryInterface.addColumn('users', 'country', {
        type: Sequelize.STRING(100),
        after: 'state'
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: () => Promise.resolve()
};
