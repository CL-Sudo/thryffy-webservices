import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('comments', {
      id: primaryKey,
      userId: foreignKey('user_id', 'users', false),
      productId: foreignKey('product_id', 'products', false),
      comment: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: async queryInterface => queryInterface.dropTable('comments')
};
