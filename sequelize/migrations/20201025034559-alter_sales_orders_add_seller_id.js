import { foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async queryInterface =>
    queryInterface.addColumn('sales_orders', 'seller_id', {
      ...foreignKey('seller_id', 'users', false),
      after: 'user_id'
    }),

  down: () => Promise.resolve()
};
