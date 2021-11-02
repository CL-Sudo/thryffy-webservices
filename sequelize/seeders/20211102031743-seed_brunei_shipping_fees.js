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

      const shippingFees = await queryInterface.sequelize.query(`select * from shipping_fees`, {
        type: Sequelize.QueryTypes.SELECT
      });

      await queryInterface.bulkInsert(
        'shipping_fees',
        shippingFees.map(instance => ({
          country_id: brunei.id,
          price: instance.price,
          markup_price: instance.markup_price,
          actual_price: instance.actual_price,
          parcel_name: instance.parcel_name,
          type: instance.type
        })),
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
