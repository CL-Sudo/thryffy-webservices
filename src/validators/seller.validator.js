import { check } from 'express-validator/check';
import _ from 'lodash';
import {
  Categories,
  SalesOrders,
  OrderItems,
  Products,
  Sizes,
  Packages,
  Subscriptions,
  Conditions
} from '@models';
import R from 'ramda';
import { DELIVERY_STATUS } from '@constants';

const isEmpty = param => R.isNil(param) || R.length(R.toString(param)) === 0;

const parsePackageMaxListing = listing => (listing === 0 ? Infinity : listing);

export const addProductValidator = async (req, fields) =>
  new Promise(async (resolve, reject) => {
    try {
      const { id } = req.user;

      const subscription = await Subscriptions.findOne({
        where: { userId: id },
        include: [{ model: Packages, as: 'package' }]
      });
      if (!subscription) {
        const listingCount = await Products.count({ where: { userId: req.user.id } });
        if (listingCount >= 30)
          throw new Error('You cannot list more than 30 items as a free user.');
      }

      if (
<<<<<<< HEAD
        subscription &&
        subscription.listingCount >= parsePackageMaxListing(subscription.package.listing)
=======
        _.get(subscription, 'listingCount', 0) >=
        parsePackageMaxListing(_.get(subscription, 'package.listing', 0))
>>>>>>> 3396eca240174c78ecdfcdea6d80a3f88cbfba51
      ) {
        throw new Error(
          `You are allowed to list ${subscription.package.listing} item only, upgrade to list more item.`
        );
      }

      const {
        title,
        brand,
        categoryId,
        conditionId,
        price,
        thumbnailIndex,
        colors,
        sizeId
      } = fields;

      if (sizeId) {
        const size = await Sizes.findOne({ where: { id: sizeId } });
        if (!size) throw new Error('Invalid sizeId given');
      }

      if (isEmpty(categoryId)) throw new Error('categoryId: Required');
      if (isEmpty(title)) throw new Error('title: Required');
      if (isEmpty(brand)) throw new Error('brand: Required');
      if (isEmpty(colors)) throw new Error('colors: Required');
      if (isEmpty(conditionId)) throw new Error('conditionId: Required');
      if (isEmpty(price)) throw new Error('price: Required');
      if (isEmpty(thumbnailIndex)) throw new Error('thumbnailIndex: Required');

      const category = await Categories.findOne({ raw: true, where: { id: categoryId } });
      if (!category) throw new Error('Invalid categoryId given');

      const condition = await Conditions.findOne({ where: { id: conditionId } });
      if (!condition) throw new Error('Invalid conditionId given');

      return resolve();
    } catch (e) {
      return reject(e);
    }
  });

export const markAsShippedValidator = [
  check('orderId')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required')
    .custom(async (orderId, { req }) => {
      const { id } = req.user;

      const order = await SalesOrders.findOne({
        where: { id: orderId },
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
      if (R.isNil(order) || sellerId !== id) throw new Error('Invalid orderId Given.');

      if (order.deliveryStatus !== DELIVERY_STATUS.TO_SHIP) {
        throw new Error(`This order has been ${R.toLower(order.deliveryStatus)}`);
      }

      return Promise.resolve();
    })
];

export const getShippingFeeValidator = [
  check('categoryId')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required')
    .custom(async categoryId => {
      const category = await Categories.findOne({ where: { id: categoryId } });
      if (!category) throw new Error('Invalid categoryId given.');

      return Promise.resolve();
    }),

  check('sizeId')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required')
    .custom(async sizeId => {
      const size = await Sizes.findOne({ where: { id: sizeId } });
      if (!size) throw new Error('Invalid sizeId given.');

      return Promise.resolve();
    })
];
