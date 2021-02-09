import { foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async queryInterface => {
    try {
      await queryInterface.removeConstraint('reviews', 'reviews_ibfk_2');
      await queryInterface.removeColumn('reviews', 'order_item_id');
      await queryInterface.addColumn('reviews', 'order_id', {
        ...foreignKey('order_id', 'sales_orders', false),
        after: 'seller_id'
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: () => Promise.resolve()
};
