import { check } from 'express-validator/check';
import { Categories, SalesOrders, OrderItems, Products } from '@models';
import R from 'ramda';
import { mapObjectsToArray } from '@utils/utils';
import { CONDITION, DELIVERY_STATUS } from '@constants';

const isEmpty = param => R.isNil(param) || R.length(R.toString(param)) === 0;

export const addProductValidator = async fields =>
  new Promise(async (resolve, reject) => {
    try {
      const { title, brand, categoryId, condition, price, thumbnailIndex, colors } = fields;
      const conditions = mapObjectsToArray(CONDITION);

      if (isEmpty(categoryId)) throw new Error('categoryId: Required');
      if (isEmpty(title)) throw new Error('title: Required');
      if (isEmpty(brand)) throw new Error('brand: Required');
      if (isEmpty(colors)) throw new Error('colors: Required');
      if (isEmpty(condition)) throw new Error('condition: Required');
      if (isEmpty(price)) throw new Error('price: Required');
      if (isEmpty(thumbnailIndex)) throw new Error('thumbnailIndex: Required');
      if (R.isNil(R.find(R.equals(condition))(conditions)))
        throw new Error('Invalid condition given.');
      const category = await Categories.findOne({ raw: true, where: { id: categoryId } });
      if (!category) throw new Error('Invalid categoryId given');

      return resolve();
    } catch (e) {
      return reject(e);
    }
  });

export const markAsShippedValidator = [
  check('deliveryTrackingNo')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required')
    .custom(async (deliveryTrackingNo, { req }) => {
      const { id } = req.user;

      const order = await SalesOrders.findOne({
        where: { deliveryTrackingNo },
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

      const sellerId = R.pathOr(null, ['orderItems', 0, 'product', 'userId'])(order);

      if (R.isNil(order) || sellerId !== id) throw new Error('Invalid Tracking No. Given.');

      if (order.deliveryStatus !== DELIVERY_STATUS.TO_SHIP) {
        throw new Error(`This order has been ${R.toLower(order.deliveryStatus)}`);
      }

      return Promise.resolve();
    })
];

export const getShippingFeeValidator = [
  check('productId')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required')
    .trim()
    .custom(async productId => {
      const ids = productId.split(',');

      if (ids.length > 3) throw new Error('Item cannot be more than 3');

      await Promise.all(
        ids.map(async id => {
          const product = await Products.findOne({ where: { id } });
          if (!product) throw new Error(`Invalid productId ${id} given`);
        })
      );
      return Promise.resolve();
    })
];
