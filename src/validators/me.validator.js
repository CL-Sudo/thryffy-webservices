import { check } from 'express-validator/check';

export const addAddressValidator = [
  check('name')
    .exists()
    .isLength({ min: 1 })
    .withMessage('name is required'),
  check('phoneNumber')
    .exists()
    .isLength({ min: 1 })
    .withMessage('phoneNumber is required'),
  check('addressLine1')
    .exists()
    .isLength({ min: 1 })
    .withMessage('addressLine1 is required'),
  check('city')
    .exists()
    .isLength({ min: 1 })
    .withMessage('city is required'),
  check('postcode')
    .exists()
    .isLength({ min: 1 })
    .withMessage('postcode is required')
];
