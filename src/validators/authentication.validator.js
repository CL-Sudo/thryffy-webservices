import { check } from 'express-validator/check';

export const registrationValidator = [
  check('password', 'Password is required').exists(),
  check('email')
    .exists()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  check('phoneNumber')
    .exists()
    .withMessage('Phone Number is required')
    .not()
    .isEmpty(),
  check('phoneCountryCode')
    .exists()
    .withMessage('country code is required')
    .isLength({ min: 2 })
    .withMessage('Minimum Length of 2 is required')
];
