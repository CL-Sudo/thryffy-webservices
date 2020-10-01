import { check } from 'express-validator/check';

export const changePasswordValidator = [
  check('password')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required'),
  check('confirmPassword')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required'),
  check('currentPassword')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required')
];

export const createValidator = [
  check('username')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required'),
  check('email')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required'),
  check('password')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required'),
  check('confirmPassword')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required')
];
