import { AT_RECORDER, BY_RECORDER, foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async queryInterface => {
    try {
      await queryInterface.createTable('category_size', {
        category_id: foreignKey('category_id', 'categories', false),
        size_id: foreignKey('size_id', 'sizes', false),
        ...AT_RECORDER,
        ...BY_RECORDER
      });
      await queryInterface.addConstraint('category_size', {
        type: 'unique',
        fields: ['category_id', 'size_id']
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: queryInterface => queryInterface.dropTable('category_size')
};
