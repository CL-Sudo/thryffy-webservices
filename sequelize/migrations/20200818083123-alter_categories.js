import { foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async queryInterface => {
    try {
      await queryInterface.addColumn('categories', 'parent_id', {
        ...foreignKey('parent_id', 'categories', { onDelete: 'CASCADE' }),
        after: 'id'
      });
      await queryInterface.dropTable('products_subcategories');
      await queryInterface.dropTable('subcategories');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: () => Promise.resolve()
};
