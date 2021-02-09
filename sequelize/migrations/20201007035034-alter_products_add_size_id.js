import { foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async queryInterface =>
    queryInterface.addColumn('products', 'size_id', {
      ...foreignKey('size_id', 'sizes', false),
      after: 'brand_id'
    }),

  down: async () => Promise.resolve()
};
