import { foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: queryInterface =>
    queryInterface.addColumn('products', 'category_id', {
      ...foreignKey('categoryId', 'categories', false),
      after: 'user_id'
    }),

  down: queryInterface => queryInterface.removeColumn('products', 'category_id')
};
