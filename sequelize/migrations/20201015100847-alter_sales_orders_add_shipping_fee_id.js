import { foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async queryInterface =>
    queryInterface.addColumn('sales_orders', 'shipping_fee_id', {
      ...foreignKey('shipping_fee_id', 'shipping_fees', false),
      after: 'sub_total'
    }),

  down: () => Promise.resolve()
};
