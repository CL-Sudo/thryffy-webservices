import { AT_RECORDER, BY_RECORDER, foreignKey, primaryKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('response_images', {
      id: primaryKey,
      responseId: foreignKey('response_id', 'dispute_responses', false),
      path: {
        type: Sequelize.STRING
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: async queryInterface => queryInterface.dropTable('response_images')
};
