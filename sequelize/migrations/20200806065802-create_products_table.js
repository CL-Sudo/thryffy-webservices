import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.createTable('products', {
        id: primaryKey,
        userId: foreignKey('user_id', 'users', false),
        categoryId: foreignKey('category_id', 'categories', false),
        title: {
          type: Sequelize.STRING(100)
        },
        description: {
          type: Sequelize.TEXT
        },
        thumbnail: {
          type: Sequelize.STRING
        },
        price: {
          type: Sequelize.DECIMAL(10, 2)
        },
        condition: {
          type: Sequelize.STRING(50)
        },
        size: {
          type: Sequelize.STRING(50)
        },
        brand: {
          type: Sequelize.STRING(100)
        },
        ...AT_RECORDER,
        ...BY_RECORDER
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: queryInterface => queryInterface.dropTable('products')
};
