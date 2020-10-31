import { validationResult } from 'express-validator/check';
import R from 'ramda';

export * from './authentication.validator';
export * from './cart.validator';
export * from './review.validator';
export * from './discover.validator';

export const removeRepeatedWhiteSpace = param => param.replace(/  +/g, ' ');

export const isEmpty = param => R.isNil(param) || R.length(R.toString(param).trim()) === 0;

export const requestValidator = req => {
  try {
    const errorFormatter = ({ location, msg, param, value, nestedErrors }) => `${param}: ${msg}`;
    validationResult(req)
      .formatWith(errorFormatter)
      .throw();
  } catch (e) {
    throw e;
  }
};
