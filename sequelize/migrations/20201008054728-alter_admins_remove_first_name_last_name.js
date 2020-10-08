module.exports = {
  up: async queryInterface => {
    try {
      await queryInterface.removeColumn('admins', 'first_name');
      await queryInterface.removeColumn('admins', 'last_name');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async () => Promise.resolve()
};
