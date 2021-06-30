import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('delivery_statuses', {
      id: primaryKey,
      order_id: foreignKey('order_id', 'sales_orders'),
      trackingmore_payload: {
        type: Sequelize.TEXT
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: async queryInterface => queryInterface.dropTable('delivery_statuses')
};
