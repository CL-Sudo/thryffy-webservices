import { foreignKey, AT_RECORDER, BY_RECORDER } from '@constants/sequelize.constant';

module.exports = {
  up: async queryInterface => {
    try {
      await queryInterface.createTable('category_product', {
        categoryId: {
          ...foreignKey('category_id', 'categories', false)
        },
        productId: {
          ...foreignKey('product_id', 'products', false)
        },
        ...AT_RECORDER,
        ...BY_RECORDER
      });
      await queryInterface.addConstraint('category_product', {
        type: 'unique',
        fields: ['category_id', 'product_id']
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: queryInterface => queryInterface.dropTable('category_product')
};
