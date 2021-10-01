import { check } from 'express-validator/check';
import { SalesOrders, Addresses, Categories, Brands, Conditions } from '@models';
import R from 'ramda';
import { DELIVERY_STATUS } from '@constants';

export const addAddressValidator = [
  check('name')
    .exists()
    .isLength({ min: 1 })
    .withMessage('name is required')
    .trim(),
  check('addressLine1')
    .exists()
    .isLength({ min: 1 })
    .withMessage('addressLine1 is required')
    .trim(),
  check('city')
    .exists()
    .isLength({ min: 1 })
    .withMessage('city is required')
    .trim(),
  check('postcode')
    .exists()
    .isLength({ min: 1 })
    .withMessage('postcode is required')
    .trim()
];

export const changePasswordValidator = [
  check('oldPassword')
    .exists()
    .isLength({ min: 4 })
    .withMessage('Required')
    .trim(),
  check('password')
    .exists()
    .isLength({ min: 4 })
    .withMessage('Required')
    .trim(),
  check('confirmPassword')
    .exists()
    .isLength({ min: 4 })
    .withMessage('Required')
    .trim()
    .custom((confirmPassword, { req }) => {
      if (confirmPassword !== req.body.password) {
        throw new Error('New passwords does not match.');
      }
      return Promise.resolve();
    })
];

export const contactUsValidator = [
  check('title')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required')
];

export const confirmOrderReceivedValidator = [
  check('orderId')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required')
    .custom(async (orderId, { req }) => {
      const { id } = req.user;
      const order = await SalesOrders.findOne({
        where: { id: orderId, userId: id }
      });

      if (R.isNil(order)) throw new Error('Invalid orderId given');

      if (order.deliveryStatus !== DELIVERY_STATUS.SHIPPED) {
        throw new Error('You can perform this action only when deliveryStatus = SHIPPED');
      }
      return Promise.resolve();
    })
];

export const getOneAddressValidator = [
  check('addressId')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required')
    .custom(async addressId => {
      const address = await Addresses.findOne({
        raw: true,
        where: { id: addressId }
      });
      if (!address) throw new Error('Invalid addressId given');
      return Promise.resolve();
    })
];

export const updatePreferencesValidator = [
  check('categoryId')
    .custom(async (categoryId = [], { req }) => {
      if (categoryId.length === 0) return Promise.resolve();
      const processedCategoryId = R.pipe(R.uniq)(categoryId);

      const categoryIdsInDB = R.map(R.prop('id'))(
        await Categories.scope([{ method: ['byCountry', req.user.countryId] }]).findAll()
      );

      const removedCategoryIds = R.without(processedCategoryId)(categoryIdsInDB);

      if (removedCategoryIds.length !== categoryIdsInDB.length - processedCategoryId.length) {
        throw new Error('Invalid categoryId given');
      }
      return Promise.resolve();
    })
    .customSanitizer(categoryId => R.uniq(categoryId)),

  check('brandId')
    .custom(async (brandId = [], { req }) => {
      if (brandId.length === 0) return Promise.resolve();

      const processedBrandId = R.pipe(R.uniq)(brandId);

      const brandIdsInDB = R.map(R.prop('id'))(
        await Brands.scope([{ method: ['byCountry', req.user.countryId] }]).findAll({
          attributes: ['id'],
          raw: true
        })
      );

      const removedBrandIds = R.without(processedBrandId)(brandIdsInDB);

      if (removedBrandIds.length !== brandIdsInDB.length - processedBrandId.length) {
        throw new Error('Invalid brandId given');
      }
      return Promise.resolve();
    })
    .customSanitizer(brandId => R.uniq(brandId)),

  check('conditionId')
    .custom(async (conditionId = []) => {
      if (conditionId.length === 0) return Promise.resolve();

      const processedConditionId = R.pipe(R.uniq)(conditionId);

      const conditionIdsInDB = R.map(R.prop('id'))(
        await Conditions.findAll({
          attributes: ['id'],
          raw: true
        })
      );

      const removedConditionIds = R.without(processedConditionId)(conditionIdsInDB);

      if (removedConditionIds.length !== conditionIdsInDB.length - processedConditionId.length) {
        throw new Error('Invalid conditionId given');
      }
      return Promise.resolve();
    })
    .customSanitizer(conditionId => R.uniq(conditionId))
];

export const updateIdentityNoValidators = [
  check('identityNo')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required')
];
