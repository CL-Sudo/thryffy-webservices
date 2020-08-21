import { foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('sales_orders', 'address_id');
      await queryInterface.removeColumn('sales_orders', 'payment_method');
      await queryInterface.addColumn('sales_orders', 'address_id', {
        ...foreignKey('address_id', 'addresses', false),
        after: 'user_id'
      });
      await queryInterface.addColumn('sales_orders', 'payment_method', {
        type: Sequelize.STRING(50),
        after: 'address_id'
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: () => Promise.resolve()
};
