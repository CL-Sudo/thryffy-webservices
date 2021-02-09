import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('notifications', {
      id: primaryKey,
      notifier_id: foreignKey('notifier_id', 'users', false),
      actor_id: foreignKey('actor_id', 'users', false),
      title: {
        type: Sequelize.STRING(200)
      },
      description: {
        type: Sequelize.STRING
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        field: 'is_read'
      },
      type: {
        type: Sequelize.STRING(20)
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: async queryInterface => queryInterface.dropTable('notifications')
};
