const { COUNTRIES } = require('../../src/constants/countries.constant');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(transaction =>
      Promise.all([
        queryInterface.bulkUpdate(
          'countries',
          { dialing_code: COUNTRIES.MALAYSIA.DIALING_CODE },
          { code: COUNTRIES.MALAYSIA.CODE },
          { transaction }
        ),
        queryInterface.bulkUpdate(
          'countries',
          { dialing_code: COUNTRIES.BRUNEI.DIALING_CODE },
          { code: COUNTRIES.BRUNEI.CODE },
          { transaction }
        )
      ])
    );
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.resolve();
  }
};
