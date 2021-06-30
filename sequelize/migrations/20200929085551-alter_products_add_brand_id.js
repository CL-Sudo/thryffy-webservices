import { foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: queryInterface =>
    queryInterface.addColumn('products', 'brand_id', {
      ...foreignKey('brand_id', 'brands', false),
      after: 'category_id'
    }),

  down: queryInterface => queryInterface.removeColumn('products', 'brands')
};
