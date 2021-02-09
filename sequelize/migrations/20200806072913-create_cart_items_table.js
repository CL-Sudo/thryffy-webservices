import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: queryInterface =>
    queryInterface.createTable('cart_items', {
      id: primaryKey,
      userId: foreignKey('user_id', 'users', false),
      productId: foreignKey('product_id', 'products', false),
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: queryInterface => queryInterface.dropTable('cart_items')
};
