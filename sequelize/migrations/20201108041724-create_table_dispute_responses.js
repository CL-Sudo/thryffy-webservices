import { AT_RECORDER, BY_RECORDER, foreignKey, primaryKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('dispute_responses', {
      id: primaryKey,
      disputeId: foreignKey('dispute_id', 'disputes', false),
      response: {
        type: Sequelize.STRING(250)
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: async queryInterface => queryInterface.dropTable('dispute_responses')
};
