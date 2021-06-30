import PARCEL_TYPE from '@constants/parcel_types.constant';

import { ShippingFees } from '@models';

module.exports = {
  up: async () => {
    try {
      const small = await ShippingFees.findOne({
        where: { type: PARCEL_TYPE.SMALL }
      });
      const medium = await ShippingFees.findOne({
        where: { type: PARCEL_TYPE.MEDIUM }
      });
      const large = await ShippingFees.findOne({
        where: { type: PARCEL_TYPE.LARGE }
      });
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

      await largeParcel2.update({ actualPrice: 15, parcelName: 'Pos Malaysia Box (L)' });
      await largeParcel3.update({ actualPrice: 15, parcelName: 'Pos Malaysia Box (L)' });
      await largeParcel.update({ price: 11, actualPrice: 15, parcelName: 'Pos Malaysia Box (L)' });
      await mediumParcel.update({ price: 9, actualPrice: 12, parcelName: 'Pos Malaysia Box (M)' });
      await small.update({ parcelName: 'Flexiprepaid S' });
      await medium.update({ parcelName: 'Flexiprepaid M' });
      await large.update({ parcelName: 'Flexiprepaid L' });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async () => Promise.resolve()
};
