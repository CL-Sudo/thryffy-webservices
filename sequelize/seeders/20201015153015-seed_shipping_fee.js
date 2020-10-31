import PARCEL from '@constants/parcel_types.constant';

module.exports = {
  up: async queryInterface => {
    try {
      const dateTime = new Date();
      await queryInterface.bulkInsert('shipping_fees', [
        {
          price: 7.0,
          markup_price: 4.0,
          actual_price: 13.0,
          type: PARCEL.TWO_ITEM_LARGE_PARCEL,
          created_at: dateTime,
          updated_at: dateTime
        },
        {
          price: 4.0,
          markup_price: 4.0,
          actual_price: 13.0,
          type: PARCEL.THREE_ITEM_LARGE_PARCEL,
          created_at: dateTime,
          updated_at: dateTime
        }
      ]);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: () => Promise.resolve()
};
