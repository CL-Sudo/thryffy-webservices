import R from 'ramda';
import { check } from 'express-validator/check';
import { Products, Addresses } from '@models';

export const payValidator = [
  check('productIds')
    .exists()
    .withMessage('Required')
    .custom(async productIds => {
      const idsLength = R.length(productIds);

      if (R.type(productIds) !== 'Array') {
        throw new Error('productIds must be an array');
      }

      if (R.length(productIds) < 1) {
        throw new Error('Empty array is not accepted');
      }

      const products = await Products.findAndCountAll({ where: { id: productIds } });
      if (products.count !== idsLength) {
        throw new Error('Invalid productIds given, product(s) not found');
      }

      if (products.count > 1) {
        const sellerIds = R.map(R.prop('userId'))(products.rows);
        if (R.sum(sellerIds) / R.length(sellerIds) !== sellerIds[0]) {
          throw new Error('All items must come from the same seller');
        }
      }

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
