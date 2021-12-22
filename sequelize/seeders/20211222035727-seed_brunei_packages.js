const { COUNTRIES } = require('../../src/constants/countries.constant');

const now = new Date();

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [brunei] = await queryInterface.sequelize.query(
      `select * from countries where code="${COUNTRIES.BRUNEI.CODE}"`,
      {
        type: Sequelize.QueryTypes.SELECT
      }
    );

    return queryInterface.bulkInsert('packages', [
      {
        title: 'Startup Plan',
        listing: 50,
        price: 9.99,
        created_at: now,
        country_id: brunei.id
      },
      {
        title: 'Medium Plan',
        listing: 250,
        price: 29.99,
        created_at: now,
        country_id: brunei.id
      },
      {
        title: 'Enterprise Plan',
        listing: 0,
        price: 88.88,
        created_at: now,
        country_id: brunei.id
      }
    ]);
  },

  down: async queryInterface => queryInterface.bulkDelete('packages')
};
