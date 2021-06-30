module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('users', 'login_frequency', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        after: 'refresh_token'
      });
      await queryInterface.addColumn('users', 'last_login', {
        type: Sequelize.DATE,
        after: 'login_frequency'
      });
      await queryInterface.addColumn('admins', 'login_frequency', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        after: 'last_name'
      });
      await queryInterface.addColumn('admins', 'last_login', {
        type: Sequelize.DATE,
        after: 'login_frequency'
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: () => Promise.resolve()
};
