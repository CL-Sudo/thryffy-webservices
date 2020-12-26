import { AT_RECORDER, BY_RECORDER, primaryKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('notification_topics', {
      id: primaryKey,
      title: {
        type: Sequelize.STRING(50)
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: async queryInterface => queryInterface.dropTable('notification_topics')
};
