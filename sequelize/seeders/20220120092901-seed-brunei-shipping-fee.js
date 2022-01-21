const { COUNTRIES } = require('../../src/constants/countries.constant');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [brunei] = await queryInterface.sequelize.query(
      `select * from countries where code="${COUNTRIES.BRUNEI.CODE}"`,
      {
        type: Sequelize.QueryTypes.SELECT
      }
    );

    const [shippingFee] = await queryInterface.sequelize.query(
      `select * from shipping_fees where country_id=${brunei.id}`,
      {
        type: Sequelize.QueryTypes.SELECT
      }
    );

    if (shippingFee) {
      return queryInterface.bulkUpdate(
        'shipping_fees',

        {
          country_id: brunei.id,
          price: 3,
          markup_price: 4,
          actual_price: 6,
          parcel_name: 'ONZ Standard',
          type: 'STANDARD'
        },
        {
          id: shippingFee.id
        }
      );
    }

    return queryInterface.bulkInsert(
      'shipping_fees',
      [
        {
          country_id: brunei.id,
          price: 3,
          markup_price: 4,
          actual_price: 6,
          parcel_name: 'ONZ Standard',
          type: 'STANDARD',
          createdAt: Sequelize.NOW,
          updatedAt: Sequelize.NOW
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
