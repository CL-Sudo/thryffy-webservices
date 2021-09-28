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
        queryInterface.addConstraint(
          'countries',
          {
            type: 'UNIQUE',
            fields: ['name']
          },
          { transaction }
        ),
        queryInterface.addConstraint(
          'countries',
          {
            fields: ['code'],
            type: 'UNIQUE'
          },
          { transaction }
        )
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
