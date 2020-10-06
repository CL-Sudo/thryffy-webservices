import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('sizes', {
      id: primaryKey,
      categoryId: foreignKey('category_id', 'categories', false),
      type: {
        type: Sequelize.STRING(50)
      },
      international: {
        type: Sequelize.STRING(10)
      },
      us: {
        type: Sequelize.STRING(10)
      },
      uk: {
        type: Sequelize.STRING(10)
      },
      eu: {
        type: Sequelize.STRING(10)
      },
      waistSize: {
        type: Sequelize.STRING(10),
        field: 'waist_size'
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: queryInterface => queryInterface.dropTable('sizes')
};
