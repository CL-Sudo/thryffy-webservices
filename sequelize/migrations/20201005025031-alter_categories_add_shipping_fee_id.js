import { foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: queryInterface =>
    queryInterface.addColumn('categories', 'shipping_fee_id', {
      ...foreignKey('shipping_fee_id', 'shipping_fees', false),
      after: 'parent_id'
    }),

  down: () => Promise.resolve()
};
