import { AT_RECORDER, BY_RECORDER, foreignKey, primaryKey } from '@constants/sequelize.constant';

module.exports = {
  up: queryInterface =>
    queryInterface.createTable('favourite_products', {
      id: primaryKey,
      productId: foreignKey('product_id', 'products', false),
      userId: foreignKey('user_id', 'users', false),
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: queryInterface => queryInterface.dropTable('favourite_products')
};
