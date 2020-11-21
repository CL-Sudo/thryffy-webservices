import { AT_RECORDER, BY_RECORDER, foreignKey, primaryKey } from '@constants/sequelize.constant';

module.exports = {
  up: async queryInterface =>
    queryInterface.createTable('feature_items', {
      id: primaryKey,
      productId: foreignKey('product_id', 'products', false),
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: async queryInterface => queryInterface.dropTable('feature_items')
};
