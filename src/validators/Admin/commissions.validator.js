import { check } from 'express-validator/check';
import * as _ from 'lodash';

const isInfinity = val => !val || _.isNaN(val);

export const addCommissionValidator = [
  check('minPrice').toFloat(),
  check('maxPrice')
    .toFloat()
    .custom((maxPrice, { req }) => {
      if (!isInfinity(maxPrice) && maxPrice <= req.body.minPrice) {
        throw new Error('Max. Price must be greater than Min. Price');
      }

      return Promise.resolve(isInfinity(maxPrice) ? undefined : maxPrice);
    }),
  check('commissionRate').toFloat(),
  check('commissionPrice').toFloat()
];
