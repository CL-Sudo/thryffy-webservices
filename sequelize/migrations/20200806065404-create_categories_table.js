import { AT_RECORDER, BY_RECORDER, primaryKey } from '@constants/sequelize.constant';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('categories', {
      id: primaryKey,
      title: {
        type: Sequelize.STRING(100)
      },
      description: {
        type: Sequelize.TEXT
      },
      thumbnail: {
        type: Sequelize.STRING
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: queryInterface => queryInterface.dropTable('categories')
};
