import { AT_RECORDER, primaryKey } from '@constants/sequelize.constant';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('search_histories', {
      id: primaryKey,
      keyword: {
        type: Sequelize.STRING
      },
      searchCount: {
        type: Sequelize.INTEGER,
        field: 'search_count',
        defaultValue: 0
      },
      ...AT_RECORDER
    }),

  down: queryInterface => queryInterface.dropTable('search_histories')
};
