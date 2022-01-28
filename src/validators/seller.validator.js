import { check } from 'express-validator/check';
import {
  Categories,
  SalesOrders,
  OrderItems,
  Products,
  Sizes,
  Packages,
  Subscriptions,
  Conditions,
  Users
} from '@models';
import R from 'ramda';
import { DELIVERY_STATUS } from '@constants';
import { NON_MEMBER_MAX_LISTING } from '@constants/subscription.constant';

const isEmpty = param => R.isNil(param) || R.length(R.toString(param)) === 0;

// const parsePackageMaxListing = listing => (listing === 0 ? Infinity : listing);

export const addProductValidator = async (req, fields) =>
  new Promise(async (resolve, reject) => {
    try {
      const { id } = req.user;

      const user = await Users.findOne({ where: { id } });
      if (!user.identityNo) {
        throw new Error('Identity No is required for your account before posting products');
      }

      const subscription = await Subscriptions.findOne({
        where: { userId: id },
        include: [{ model: Packages, as: 'package' }]
      });

      const listingCount = await Products.count({
        where: { userId: req.user.id, isPublished: true, isVerify: true }
      });

      if (!subscription) {
        if (listingCount >= NON_MEMBER_MAX_LISTING)
          throw new Error(
            `You cannot list more than ${NON_MEMBER_MAX_LISTING} items as a free user.`
          );
      } else if (listingCount >= user.maxListing) {
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

      const category = await Categories.scope([
        { method: ['byCountry', req.user.countryId] }
      ]).findOne({ raw: true, where: { id: categoryId } });
      if (!category) throw new Error('Invalid categoryId given');

      const condition = await Conditions.findOne({ where: { id: conditionId } });
      if (!condition) throw new Error('Invalid conditionId given');

      return resolve();
    } catch (e) {
      return reject(e);
    }
  });

export const markAsShippedValidator = async req => {
  try {
    const { id } = req.user;
    const { orderId, deliveryTrackingNo } = req.body;

    if (isEmpty(orderId)) throw new Error('orderId required');
    if (isEmpty(deliveryTrackingNo)) throw new Error('deliveryTrackingNo required');

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
  } catch (e) {
    return Promise.reject(e);
  }
};

// export const markAsShippedValidator = [
//   check('orderId')
//     .exists()
//     .isLength({ min: 1 })
//     .withMessage('Required')
//     .custom(async (orderId, { req }) => {
//       const { id } = req.user;

//       const order = await SalesOrders.findOne({
//         where: { id: orderId },
//         include: [
//           {
//             model: OrderItems,
//             as: 'orderItems',
//             include: [
//               {
//                 model: Products,
//                 as: 'product'
//               }
//             ]
//           }
//         ]
//       });

//       const sellerId = R.pathOr(null, ['orderItems', 0, 'product', 'userId'])(order);
//       if (R.isNil(order) || sellerId !== id) throw new Error('Invalid orderId Given.');

//       if (order.deliveryStatus !== DELIVERY_STATUS.TO_SHIP) {
//         throw new Error(`This order has been ${R.toLower(order.deliveryStatus)}`);
//       }

//       return Promise.resolve();
//     })
// ];

export const getShippingFeeValidator = [
  check('categoryId')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required')
    .custom(async (categoryId, { req }) => {
      const category = await Categories.scope([
        { method: ['byCountry', req.user.countryId] }
      ]).findOne({ where: { id: categoryId } });
      if (!category) throw new Error('Invalid categoryId given.');

      return Promise.resolve();
    })

  // check('sizeId')
  //   .exists()
  //   .isLength({ min: 1 })
  //   .withMessage('Required')
  //   .custom(async sizeId => {
  //     const size = await Sizes.findOne({ where: { id: sizeId } });
  //     if (!size) throw new Error('Invalid sizeId given.');

  //     return Promise.resolve();
  //   })
];
