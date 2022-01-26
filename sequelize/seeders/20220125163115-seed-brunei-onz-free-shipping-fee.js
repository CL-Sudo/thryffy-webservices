import PARCEL_TYPE from '@constants/parcel_types.constant';

const { PARCEL_NAME } = require('@constants/parcel_types.constant');
const { COUNTRIES } = require('../../src/constants/countries.constant');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [brunei] = await queryInterface.sequelize.query(
      `select * from countries where code="${COUNTRIES.BRUNEI.CODE}"`,
      {
        type: Sequelize.QueryTypes.SELECT
      }
    );

    return queryInterface.bulkInsert(
      'shipping_fees',
      [
        {
          country_id: brunei.id,
          price: 0,
          markup_price: 0,
          actual_price: 0,
          parcel_name: PARCEL_NAME.ONZ_STANDARD,
          type: PARCEL_TYPE.ONZ_FREE_SHIPPING,
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      {}
    );
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
