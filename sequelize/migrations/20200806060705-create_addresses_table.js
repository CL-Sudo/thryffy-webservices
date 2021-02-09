import { AT_RECORDER, BY_RECORDER, primaryKey, foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('addresses', {
      id: primaryKey,
      userId: foreignKey('user_id', 'users', false),
      title: {
        type: Sequelize.STRING(100)
      },
      addressLine1: {
        type: Sequelize.STRING(150),
        field: 'address_line_1'
      },
      addressLine2: {
        type: Sequelize.STRING(150),
        field: 'address_line_2'
      },
      city: {
        type: Sequelize.STRING(100)
      },
      state: {
        type: Sequelize.STRING(100)
      },
      postcode: {
        type: Sequelize.STRING(100)
      },
      isDefault: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'is_default'
      },
      ...AT_RECORDER,
      ...BY_RECORDER
    }),

  down: queryInterface => queryInterface.dropTable('addresses')
};
