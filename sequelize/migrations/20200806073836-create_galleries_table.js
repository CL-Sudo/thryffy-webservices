import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('galleries', {
      id: primaryKey,
      productId: foreignKey('product_id', 'products', false),
      caption: {
        type: Sequelize.STRING
      },
      filePath: {
        type: Sequelize.STRING
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: queryInterface => queryInterface.dropTable('galleries')
};
