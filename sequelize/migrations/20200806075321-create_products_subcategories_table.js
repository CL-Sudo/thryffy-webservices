import { AT_RECORDER, BY_RECORDER, foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: queryInterface =>
    queryInterface.createTable('products_subcategories', {
      productId: foreignKey('product_id', 'products', false),
      subcategoryId: foreignKey('subcategory_id', 'subcategories', false),
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: queryInterface => queryInterface.dropTable('products_subcategories')
};
