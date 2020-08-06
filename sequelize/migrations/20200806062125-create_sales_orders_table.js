import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.createTable('sales_orders', {
        id: primaryKey,
        userId: foreignKey('user_id', 'users', false),
        paymentStatus: {
          type: Sequelize.STRING(50),
          field: 'payment_status'
        },
        deliveryStatus: {
          type: Sequelize.STRING(50),
          field: 'delivery_status'
        },
        deliveryTrackingNo: {
          type: Sequelize.TEXT,
          field: 'delivery_tracking_no'
        },
        grandTotal: {
          type: Sequelize.DECIMAL(10, 2),
          field: 'grand_total'
        },
        ...AT_RECORDER,
        ...BY_RECORDER
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },
  down: queryInterface => queryInterface.dropTable('sales_orders')
};
