import { Galleries, Notifications, OrderItems, Products, SalesOrders } from '@models';
import MODEL from '@constants/model.constant';
import R from 'ramda';
import * as _ from 'lodash';

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

Notifications.addHook('afterCreate', 'addProductImagePath', async (instance, { transaction }) => {
  try {
    if (instance.notifiableType === MODEL.POLYMORPHISM.NOTIFICATIONS.PRODUCT) {
      const gallery = await Galleries.findAll({
        limit: 1,
        where: { productId: instance.notifiableId }
      });

      if (!_.isEmpty(gallery)) {
        await instance.update({ image: _.get(gallery, '[0].filePath', null) }, { transaction });
      }
    }

    if (instance.notifiableType === MODEL.POLYMORPHISM.NOTIFICATIONS.SALE_ORDER) {
      const order = await SalesOrders.findOne({
        where: { id: instance.notifiableId },
        include: [
          {
            model: OrderItems,
            as: 'orderItems',
            include: [
              {
                model: Products,
                as: 'product'
              }
            ]
          }
        ]
      });

      const image = _.get(order, 'orderItems[0].product.thumbnail', null);
      await instance.update({ image }, { transaction });
    }
  } catch (e) {
    throw e;
  }
});
