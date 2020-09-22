import { check } from 'express-validator/check';
import { SalesOrders, Addresses } from '@models';
import R from 'ramda';
import { DELIVERY_STATUS } from '@constants';

export const addAddressValidator = [
  check('name')
    .exists()
    .isLength({ min: 1 })
    .withMessage('name is required')
    .trim(),
  check('phoneNumber')
    .exists()
    .isLength({ min: 1 })
    .withMessage('phoneNumber is required')
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
        throw new Error('Confirmation password does not match.');
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
        raw: true,
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
