import { AT_RECORDER, BY_RECORDER, foreignKey, primaryKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('disputes', {
      id: primaryKey,
      orderId: foreignKey('order_id', 'sales_orders', false),
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING(250)
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: async queryInterface => queryInterface.dropTable('disputes')
};
