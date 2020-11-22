import { AT_RECORDER, BY_RECORDER, foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async queryInterface => {
    try {
      await queryInterface.createTable('preferences', {
        category_id: foreignKey('category_id', 'categories', false),
        user_id: foreignKey('user_id', 'users', false),
        ...AT_RECORDER,
        ...BY_RECORDER
      });
      await queryInterface.addConstraint('preferences', {
        type: 'unique',
        fields: ['category_id', 'user_id']
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: queryInterface => queryInterface.dropTable('category_size')
};
