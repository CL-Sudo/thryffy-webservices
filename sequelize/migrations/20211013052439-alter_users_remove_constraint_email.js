module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    return queryInterface.sequelize.transaction(transaction => {
      return Promise.all([
        // queryInterface.changeColumn(
        //   'users',
        //   'email',
        //   {
        //     type: Sequelize.STRING,
        //     unique: false,
        //     allowNull: true,
        //     after: 'username'
        //   },
        //   { transaction }
        // )
        queryInterface.removeConstraint('users', 'email', { transaction }),
        queryInterface.removeConstraint('users', 'email_2', { transaction })
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
