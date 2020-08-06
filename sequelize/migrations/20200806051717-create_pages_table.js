import { AT_RECORDER, BY_RECORDER, primaryKey } from '@constants/sequelize.constant';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('pages', {
      id: primaryKey,
      title: {
        type: Sequelize.STRING(200)
      },
      content: {
        type: Sequelize.TEXT
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: queryInterface => queryInterface.dropTable('pages')
};
