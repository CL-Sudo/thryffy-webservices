import { AT_RECORDER, BY_RECORDER, foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async queryInterface =>
    queryInterface.createTable('notification_topic_users', {
      topic_id: foreignKey('topic_id', 'notification_topics', false),
      user_id: foreignKey('user_id', 'users', false),
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: async queryInterface => Promise.resolve()
};
