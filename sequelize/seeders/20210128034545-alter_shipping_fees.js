import PARCEL_TYPE from '@constants/parcel_types.constant';

import { ShippingFees } from '@models';

module.exports = {
  up: async () => {
    try {
      const mediumParcel = await ShippingFees.findOne({
        where: { type: PARCEL_TYPE.MEDIUM_PARCEL }
      });
      const largeParcel = await ShippingFees.findOne({
        where: { type: PARCEL_TYPE.LARGE_PARCEL }
      });
      const largeParcel2 = await ShippingFees.findOne({
        where: { type: PARCEL_TYPE.TWO_ITEM_LARGE_PARCEL }
      });
      const largeParcel3 = await ShippingFees.findOne({
        where: { type: PARCEL_TYPE.THREE_ITEM_LARGE_PARCEL }
      });

      await largeParcel2.update({ actualPrice: 15.5 });
      await largeParcel3.update({ actualPrice: 15.5 });
      await largeParcel.update({ actualPrice: 15.5 });
      await mediumParcel.update({ actualPrice: 13.5 });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async () => Promise.resolve()
};
