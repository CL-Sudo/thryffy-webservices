const { COUNTRIES } = require('../../src/constants/countries.constant');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let [country] = await queryInterface.sequelize.query(
      `SELECT id FROM countries WHERE code="${COUNTRIES.MALAYSIA.CODE}"`,
      {
        type: Sequelize.QueryTypes.SELECT
      }
    );

    return queryInterface.sequelize.transaction(async transaction => {
      if (!country) {
        const countryId = await queryInterface.bulkInsert(
          'countries',
          [
            {
              name: COUNTRIES.MALAYSIA.NAME,
              code: COUNTRIES.MALAYSIA.CODE,
              currency_symbol: COUNTRIES.MALAYSIA.CURRENCY_SYMBOL
            }
          ],
          { transaction }
        );
        country = { id: countryId };
      }
      return Promise.all([
        queryInterface.bulkUpdate(
          'banners',
          { country_id: country.id },
          // {},
          { country_id: null },
          { transaction }
        ),
        queryInterface.bulkUpdate(
          'brands',
          { country_id: country.id },
          // {},
          { country_id: null },
          { transaction }
        ),
        queryInterface.bulkUpdate(
          'commission_free_campaigns',
          { country_id: country.id },
          // {},
          { country_id: null },
          { transaction }
        ),
        queryInterface.bulkUpdate(
          'commissions',
          { country_id: country.id },
          // {},
          { country_id: null },
          { transaction }
        ),
        queryInterface.bulkUpdate(
          'marketing_notifications',
          { country_id: country.id },
          // {},
          { country_id: null },
          { transaction }
        ),
        queryInterface.bulkUpdate(
          'packages',
          { country_id: country.id },
          // {},
          { country_id: null },
          { transaction }
        ),
        queryInterface.bulkUpdate(
          'products',
          { country_id: country.id },
          // {},
          { country_id: null },
          { transaction }
        ),
        queryInterface.bulkUpdate(
          'sales_orders',
          { country_id: country.id },
          // {},
          { country_id: null },
          { transaction }
        ),
        queryInterface.bulkUpdate(
          'users',
          { country_id: country.id },
          // {},
          { country_id: null },
          { transaction }
        ),
        queryInterface.bulkUpdate(
          'categories',
          { country_id: country.id },
          // {},
          { country_id: null },
          { transaction }
        ),
        queryInterface.bulkUpdate(
          'admins',
          { country_id: country.id },
          // {},
          { country_id: null },
          { transaction }
        ),
        queryInterface.bulkUpdate(
          'shipping_fees',
          { country_id: country.id },
          // {},
          { country_id: null },
          { transaction }
        )
      ]);
    });
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.resolve();
  }
};
