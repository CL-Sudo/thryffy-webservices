import { check } from 'express-validator/check';

export const addAddressValidator = [
  check('name')
    .exists()
    .withMessage('name is required'),
  check('phoneNumber')
    .exists()
    .withMessage('phoneNumber is required'),
  check('addressLine1')
    .exists()
    .withMessage('addressLine1 is required'),
  check('city')
    .exists()
    .withMessage('city is required'),
  check('postcode')
    .exists()
    .withMessage('postcode is required')
];
