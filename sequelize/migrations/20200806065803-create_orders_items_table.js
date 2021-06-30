import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.createTable('order_items', {
        id: primaryKey,
        salesOrderId: foreignKey('sales_order_id', 'sales_orders', false),
        productId: foreignKey('product_id', 'products', false),
        itemName: {
          type: Sequelize.STRING(150),
          field: 'item_name'
        },
        price: {
          type: Sequelize.DECIMAL(10, 2)
        },
        ...AT_RECORDER,
        ...BY_RECORDER
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: queryInterface => queryInterface.dropTable('order_items')
};
