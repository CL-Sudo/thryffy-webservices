import _ from 'lodash';
import moment from 'moment';
import PARCEL_TYPE, { PARCEL_NAME } from '@constants/parcel_types.constant';

export const generateOrderNumber = orderId =>
  `${moment().format('YYYY')}${_.padStart(orderId, 8, '0')}`;

export const parseParcelName = parcelType => {
  let parcelName;
  switch (parcelType) {
    case PARCEL_TYPE.LARGE:
      parcelName = PARCEL_NAME.FLEXI_PREPAID_L;
      break;

    case PARCEL_TYPE.MEDIUM:
      parcelName = PARCEL_NAME.FLEXI_PREPAID_M;
      break;

    case PARCEL_TYPE.SMALL:
      parcelName = PARCEL_NAME.FLEXI_PREPAID_S;
      break;

    case PARCEL_TYPE.MEDIUM_PARCEL:
      parcelName = PARCEL_NAME.MEDIUM_PARCEL;
      break;

    case PARCEL_TYPE.LARGE_PARCEL:
      parcelName = PARCEL_NAME.LARGE_PARCEL;
      break;

    case PARCEL_TYPE.TWO_ITEM_LARGE_PARCEL:
      parcelName = PARCEL_NAME.LARGE_PARCEL;
      break;

    case PARCEL_TYPE.THREE_ITEM_LARGE_PARCEL:
      parcelName = PARCEL_NAME.LARGE_PARCEL;
      break;

    default:
  }

  return parcelName;
};
