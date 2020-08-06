import { AT_RECORDER, BY_RECORDER, primaryKey } from '@constants/sequelize.constant';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('subcategories', {
      id: primaryKey,
      title: {
        type: Sequelize.STRING(100)
      },
      description: {
        type: Sequelize.TEXT
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: queryInterface => queryInterface.dropTable('subcategories')
};
