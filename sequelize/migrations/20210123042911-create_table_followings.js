import { AT_RECORDER, BY_RECORDER, foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async queryInterface =>
    queryInterface.createTable('followings', {
      followerId: foreignKey('follower_id', 'users'),
      sellerId: foreignKey('seller_id', 'users'),
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: async queryInterface => queryInterface.dropTable('followings')
};
