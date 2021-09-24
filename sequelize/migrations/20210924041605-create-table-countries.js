import { AT_RECORDER, BY_RECORDER, primaryKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     */
    return queryInterface.createTable('countries', {
      id: primaryKey,
      name: {
        type: Sequelize.STRING(100)
      },
      code: {
        type: Sequelize.STRING(3)
      },
      flag: {
        type: Sequelize.TEXT
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return queryInterface.dropTable('countries');
  }
};
