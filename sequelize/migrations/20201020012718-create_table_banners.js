import { primaryKey, AT_RECORDER, BY_RECORDER } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('banners', {
      id: primaryKey,
      path: Sequelize.STRING,
      index: Sequelize.INTEGER,
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: async queryInterface => queryInterface.dropTable('banners')
};
