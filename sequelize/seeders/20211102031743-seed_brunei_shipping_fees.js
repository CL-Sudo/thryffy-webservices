const { BRUNEI_FEE } = require('@constants/shipping.constant');
const { COUNTRIES } = require('../../src/constants/countries.constant');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      const [brunei] = await queryInterface.sequelize.query(
        `select * from countries where code="${COUNTRIES.BRUNEI.CODE}"`,
        {
          type: Sequelize.QueryTypes.SELECT
        }
      );

      await queryInterface.bulkInsert(
        'shipping_fees',
        [
          {
            country_id: brunei.id,
            price: BRUNEI_FEE.SHIPPING,
            markup_price: 4,
            actual_price: 8
          }
        ],
        { transaction }
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return Promise.resolve();
  }
};
