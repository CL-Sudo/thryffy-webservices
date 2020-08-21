import { validationResult } from 'express-validator/check';

export * from './authentication.validator';
export * from './checkout.validator';

export const reqeustValidator = req => {
  try {
    const errorFormatter = ({ location, msg, param, value, nestedErrors }) => `${param}: ${msg}`;
    validationResult(req)
      .formatWith(errorFormatter)
      .throw();
  } catch (e) {
    throw e;
  }
};
