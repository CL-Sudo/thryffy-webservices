import { primaryKey, foreignKey, AT_RECORDER, BY_RECORDER } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('enquiries', {
      id: primaryKey,
      userId: foreignKey('user_id', 'users', false),
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING(250)
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: async () => Promise.resolve()
};
