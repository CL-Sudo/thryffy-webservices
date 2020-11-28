import { Notifications } from '@models';
import MODEL from '@constants/model.constant';
import R from 'ramda';

Notifications.addHook('afterFind', findResult => {
  try {
    if (!Array.isArray(findResult)) findResult = [findResult];

    findResult.forEach(instance => {
      switch (true) {
        case instance.notifiableType === MODEL.POLYMORPHISM.NOTIFICATIONS.DISPUTE &&
          !R.isNil(instance.dispute): {
          delete instance.product;
          delete instance.dataValues.product;
          delete instance.order;
          delete instance.dataValues.order;
          delete instance.review;
          delete instance.dataValues.review;
          break;
        }

        case instance.notifiableType === MODEL.POLYMORPHISM.NOTIFICATIONS.PRODUCT &&
          !R.isNil(instance.product): {
          delete instance.dispute;
          delete instance.dataValues.dispute;
          delete instance.order;
          delete instance.dataValues.order;
          delete instance.review;
          delete instance.dataValues.review;
          break;
        }

        case instance.notifiableType === MODEL.POLYMORPHISM.NOTIFICATIONS.REVIEW &&
          !R.isNil(instance.review): {
          delete instance.product;
          delete instance.dataValues.product;
          delete instance.dispute;
          delete instance.dataValues.dispute;
          delete instance.order;
          delete instance.dataValues.order;
          break;
        }

        case instance.notifiableType === MODEL.POLYMORPHISM.NOTIFICATIONS.SALE_ORDER &&
          !R.isNil(instance.order): {
          delete instance.product;
          delete instance.dataValues.product;
          delete instance.dispute;
          delete instance.dataValues.dispute;
          delete instance.review;
          delete instance.dataValues.review;
          break;
        }
        default:
      }
    });
  } catch (e) {
    throw e;
  }
});
