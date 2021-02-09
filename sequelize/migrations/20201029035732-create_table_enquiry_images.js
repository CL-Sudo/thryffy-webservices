import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('enquiry_images', {
      id: primaryKey,
      enquiryId: foreignKey('enquiry_id', 'enquiries', false),
      path: {
        type: Sequelize.STRING
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: async queryInterface => queryInterface.dropTable('enquiry_images')
};
