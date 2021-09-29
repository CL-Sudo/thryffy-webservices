import R from 'ramda';
import { check } from 'express-validator/check';
import { Products, Addresses, CartItems, FavouriteProducts } from '@models';

export const payValidator = [
  check('productIds')
    .exists()
    .withMessage('Required')
    .custom(async (productIds, { req }) => {
      const idsLength = R.length(productIds);

      if (R.type(productIds) !== 'Array') {
        throw new Error('productIds must be an array');
      }

      if (R.length(productIds) < 1) {
        throw new Error('Empty array is not accepted');
      }

      const products = await Products.scope([
        { method: ['byCountry', req.user.countryId] }
      ]).findAndCountAll({ where: { id: productIds } });
      if (products.count !== idsLength) {
        throw new Error('Invalid productIds given, product(s) not found');
      }

      if (products.count > 1) {
        const sellerIds = R.map(R.prop('userId'))(products.rows);
        if (R.sum(sellerIds) / R.length(sellerIds) !== sellerIds[0]) {
          throw new Error('All items must come from the same seller');
        }
      }

      if (R.length(productIds) > 3) {
        throw new Error('Items to be checkout cannot be more than 3');
      }

      // const cartItems = await CartItems.findAndCountAll({ where: { userId: req.user.id } });
      // const cartItemIds = R.map(R.prop('productId'), cartItems.rows);

      // R.map(id => {
      //   if (!R.includes(id, cartItemIds)) {
      //     throw new Error(`productId ${id} not found in cart`);
      //   }
      // })(productIds);

      return Promise.resolve();
    }),
  check('addressId')
    .exists()
    .withMessage('Required')
    .custom(async addressId => {
      if (R.length(R.toString(addressId)) < 1) {
        throw new Error('Required');
      }

      const address = await Addresses.findOne({ raw: true, where: { id: addressId } });
      if (R.isNil(address)) {
        throw new Error('Invalid addressId given.');
      }

      return Promise.resolve();
    }),
  check('courier')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required')
    .customSanitizer(val => R.toUpper(val)),
  check('paymentMethod')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required')
    .customSanitizer(val => R.toUpper(val))
];

export const checkoutValidator = [
  check('productIds')
    .exists()
    .withMessage('Required')
    .custom(async (productIds, { req }) => {
      const idsLength = R.length(productIds);

      if (R.type(productIds) !== 'Array') {
        throw new Error('productIds must be an array');
      }

      if (R.length(productIds) < 1) {
        throw new Error('Empty array is not accepted');
      }

      const products = await Products.scope([
        { method: ['byCountry', req.user.countryId] }
      ]).findAndCountAll({ where: { id: productIds } });
      if (products.count !== idsLength) {
        throw new Error('Invalid productIds given, product(s) not found');
      }

      if (products.count > 1) {
        const sellerIds = R.map(R.prop('userId'))(products.rows);
        if (R.sum(sellerIds) / R.length(sellerIds) !== sellerIds[0]) {
          throw new Error('All items must come from the same seller');
        }
      }

      if (R.length(productIds) > 3) {
        throw new Error('Items to be checkout cannot be more than 3');
      }

      // const cartItems = await CartItems.findAndCountAll({ where: { userId: req.user.id } });
      // const cartItemIds = R.map(R.prop('productId'), cartItems.rows);

      // R.map(id => {
      //   if (!R.includes(id, cartItemIds)) {
      //     throw new Error(`productId ${id} not found in cart`);
      //   }
      //   return true;
      // })(productIds);

      return Promise.resolve();
    })
];

export const saveForLaterValidator = [
  check('productId')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required')
    .custom(async (productId, { req }) => {
      const { id } = req.user;
      const product = await Products.scope([{ method: ['byCountry', req.user.countryId] }]).findOne(
        {
          raw: true,
          where: { id: productId }
        }
      );

      if (R.isNil(product)) throw new Error('Invalid productId given.');

      if (product.userId === id)
        throw new Error('You cannot add your own product to favourite list');

      const cartItem = await CartItems.findOne({
        where: {
          userId: req.user.id,
          productId
        }
      });

      if (R.isNil(cartItem)) throw new Error('This item is not in the cart');

      const favoutireProduct = await FavouriteProducts.findOne({
        raw: true,
        where: {
          productId,
          userId: req.user.id
        }
      });

      if (!R.isNil(favoutireProduct))
        throw new Error('This item is already in your favourite list.');

      return Promise.resolve();
    })
];
