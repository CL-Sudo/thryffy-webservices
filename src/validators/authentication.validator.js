import { check } from 'express-validator/check';
import { Users } from '@models';
import R from 'ramda';
import jwt from 'jsonwebtoken';
import * as configs from '@configs';

export const registrationValidator = [
  check('username')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required'),
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

export const forgotPasswordValidator = [
  check('email')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required')
    .isEmail()
    .withMessage('Invalid Format')
    .normalizeEmail()
    .custom(async (email, { req }) => {
      const user = await Users.findOne({ raw: true, where: { email } });
      if (R.isNil(user)) throw new Error('Invalid email address given, no user found');
      req.body.userId = user.id;
    })
];

export const resetPasswordValidator = [
  check('resetToken')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required')
    .custom(async (resetToken, { req }) => {
      try {
        const decoded = jwt.verify(resetToken, configs.jwt.secret);
        const user = await Users.findOne({
          where: { id: decoded.authData }
        });
        if (R.isNil(user)) throw new Error('Invalid resetToken given.');
        req.body.userId = user.id;
        return Promise.resolve();
      } catch (e) {
        if (e.message === 'jwt expired') {
          return Promise.reject(new Error('Reset Token is Expired'));
        }
        return Promise.reject(e);
      }
    }),
  check('password')
    .exists()
    .withMessage('Required')
    .isLength({ min: 4 })
    .withMessage('Minimum length of 4 is required'),
  check('confirmPassword')
    .exists()
    .withMessage('Required')
    .isLength({ min: 4 })
    .withMessage('Minimum length of 4 is required')
    .custom((confirmPassword, { req }) => {
      const { password } = req.body;
      if (password !== confirmPassword) {
        throw new Error('Confirmation password does not match.');
      }
      return Promise.resolve();
    })
];
