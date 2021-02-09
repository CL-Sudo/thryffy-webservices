import { AT_RECORDER, BY_RECORDER, foreignKey, primaryKey } from '@constants/sequelize.constant';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('reviews', {
      id: primaryKey,
      userId: foreignKey('user_id', 'users', false),
      orderItemId: foreignKey('order_item_id', 'order_items', false),
      rating: {
        type: Sequelize.INTEGER
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: queryInterface => queryInterface.dropTable('reviews')
};
