import { Galleries, Notifications } from '@models';
import MODEL from '@constants/model.constant';
import R from 'ramda';

Notifications.addHook('afterFind', async findResult => {
  try {
    if (findResult && !Array.isArray(findResult)) findResult = [findResult];
    if (!findResult && !Array.isArray(findResult)) findResult = [];

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
          delete instance.user;
          delete instance.dataValues.user;

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
          delete instance.user;
          delete instance.dataValues.user;

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
          delete instance.user;
          delete instance.dataValues.user;

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
          delete instance.user;
          delete instance.dataValues.user;

          break;
        }

        case instance.notifiableType === MODEL.POLYMORPHISM.NOTIFICATIONS.USER &&
          !R.isNil(instance.user): {
          delete instance.product;
          delete instance.dataValues.product;
          delete instance.dispute;
          delete instance.dataValues.dispute;
          delete instance.review;
          delete instance.dataValues.review;
          delete instance.order;
          delete instance.dataValues.order;

          break;
        }

        default:
      }
    });
  } catch (e) {
    throw e;
  }
});

Notifications.addHook('afterCreate', 'addProductImagePath', async instance => {
  try {
    if (instance.notifiableType === MODEL.POLYMORPHISM.NOTIFICATIONS.PRODUCT) {
      const gallery = await Galleries.findOne({
        where: { productId: instance.productId, index: 0 }
      });

      await instance.update({ image: gallery.filePath });
    }
  } catch (e) {
    throw e;
  }
});
