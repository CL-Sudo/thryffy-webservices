import { foreignKey, primaryKey, AT_RECORDER, BY_RECORDER } from '@constants/sequelize.constant';

module.exports = {
  up: queryInterface =>
    queryInterface.createTable('view_histories', {
      id: primaryKey,
      productId: foreignKey('product_id', 'products', false),
      userId: foreignKey('user_id', 'users', false),
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: queryInterface => queryInterface.dropTable('view_histories')
};
