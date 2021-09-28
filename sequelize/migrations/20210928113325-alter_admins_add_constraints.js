module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return queryInterface.sequelize.transaction(async transaction => {
      return Promise.all([
        queryInterface.changeColumn('admins', 'email', {
          type: Sequelize.STRING,
          allowNull: false,
          unique: false,
          after: 'username'
        }),
        await queryInterface.addConstraint('admins', {
          type: 'unique',
          fields: ['email', 'country_id']
        })
      ]);
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return Promise.resolve();
  }
};
