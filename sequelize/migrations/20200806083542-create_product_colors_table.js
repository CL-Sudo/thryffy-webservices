import { AT_RECORDER, BY_RECORDER, foreignKey, primaryKey } from '@constants/sequelize.constant';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('product_colors', {
      id: primaryKey,
      productId: foreignKey('product_id', 'products', false),
      color: {
        type: Sequelize.STRING(50)
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: queryInterface => queryInterface.dropTable('product_colors')
};
