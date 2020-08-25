import { check } from 'express-validator/check';

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
