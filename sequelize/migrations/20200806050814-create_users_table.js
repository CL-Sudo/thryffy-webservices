import { AT_RECORDER, BY_RECORDER, primaryKey } from '@constants/sequelize.constant';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('users', {
      id: primaryKey,
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING(100),
        field: 'first_name'
      },
      lastName: {
        type: Sequelize.STRING(100),
        field: 'last_name'
      },
      phoneCountryCode: {
        type: Sequelize.STRING(5),
        field: 'phone_country_code'
      },
      phoneNumber: {
        type: Sequelize.STRING(25),
        field: 'phone_number'
      },
      facebookId: {
        type: Sequelize.STRING,
        field: 'facebook_id'
      },
      googleId: {
        type: Sequelize.STRING,
        field: 'google_id'
      },
      profilePicture: {
        type: Sequelize.STRING,
        field: 'profile_picture'
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: queryInterface => queryInterface.dropTable('users')
};
