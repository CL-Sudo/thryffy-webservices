import { AT_RECORDER, BY_RECORDER, foreignKey, primaryKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('dispute_images', {
      id: primaryKey,
      disputeId: foreignKey('dispute_id', 'disputes', false),
      path: {
        type: Sequelize.STRING
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: async queryInterface => queryInterface.dropTabble('dispute_images')
};
