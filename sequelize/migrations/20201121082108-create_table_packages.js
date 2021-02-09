import { AT_RECORDER, BY_RECORDER, primaryKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('packages', {
      id: primaryKey,
      title: {
        type: Sequelize.STRING(50)
      },
      listing: {
        type: Sequelize.INTEGER
      },
      price: {
        type: Sequelize.DECIMAL(10, 2)
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: async queryInterface => queryInterface.dropTable('packages')
};
