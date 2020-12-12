import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('notification_settings', {
      id: primaryKey,
      userId: foreignKey('user_id', 'users', false),
      isOrderAllowed: {
        type: Sequelize.BOOLEAN,
        field: 'is_order_allowed',
        defaultValue: true
      },
      isPromotionAllowed: {
        type: Sequelize.BOOLEAN,
        field: 'is_promotion_allowed',
        defaultValue: true
      },
      isReminderAllowed: {
        type: Sequelize.BOOLEAN,
        field: 'is_reminder_allowed',
        defaultValue: true
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: async queryInterface => queryInterface.dropTable('notification_settings')
};
