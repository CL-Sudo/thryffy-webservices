import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async queryInterface =>
    queryInterface.createTable('view_histories', {
      id: primaryKey,
      product_id: foreignKey('product_id', 'products', false),
      user_id: foreignKey('user_id', 'users', false),
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: queryInterface => queryInterface.dropTable('view_histories')
};
