import { AT_RECORDER, BY_RECORDER, primaryKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('otps', {
      id: primaryKey,
      phone_country_code: {
        type: Sequelize.STRING(5),
        allowNull: false
      },
      phone_number: {
        type: Sequelize.STRING(25),
        allowNull: false
      },
      otp: {
        type: Sequelize.STRING(25),
        allowNull: false
      },
      otp_validity: {
        type: Sequelize.DATE,
        allowNull: false
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: async queryInterface => queryInterface.dropTable('otps')
};
