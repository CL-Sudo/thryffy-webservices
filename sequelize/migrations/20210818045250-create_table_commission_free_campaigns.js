import { AT_RECORDER, BY_RECORDER, primaryKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('commission_free_campaigns', {
      id: primaryKey,
      startDate: {
        type: Sequelize.DATE,
        field: 'start_date',
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        field: 'end_date',
        allowNull: false
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('commission_free_campaigns');
  }
};
