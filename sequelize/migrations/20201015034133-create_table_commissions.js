import { AT_RECORDER, BY_RECORDER, primaryKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('commissions', {
      id: primaryKey,
      minPrice: {
        type: Sequelize.DECIMAL(10, 2),
        field: 'min_price'
      },
      maxPrice: {
        type: Sequelize.DECIMAL(10, 2),
        field: 'max_price'
      },
      commissionRate: {
        type: Sequelize.DECIMAL(10, 2),
        field: 'commission_rate'
      },
      commissionPrice: {
        type: Sequelize.DECIMAL(10, 2),
        field: 'commission_price'
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: async queryInterface => queryInterface.dropTable('commissions')
};
