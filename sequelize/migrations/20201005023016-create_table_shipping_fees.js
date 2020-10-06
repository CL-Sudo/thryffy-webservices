import { AT_RECORDER, BY_RECORDER, primaryKey } from '@constants/sequelize.constant';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('shipping_fees', {
      id: primaryKey,
      price: {
        type: Sequelize.DECIMAL(10, 2)
      },
      markup_price: {
        type: Sequelize.DECIMAL(10, 2),
        field: 'markup_price'
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: queryInterface => queryInterface.dropTable('shipping_fees')
};
