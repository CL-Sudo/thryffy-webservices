import { check } from 'express-validator/check';
import * as _ from 'lodash';

export const addCommissionValidator = [
  check('minPrice').toFloat(),
  check('maxPrice')
    .toFloat()
    .custom((maxPrice, { req }) => {
      if (!_.isNaN(maxPrice) && maxPrice <= req.body.minPrice) {
        throw new Error('Max. Price must be greater than Min. Price');
      }
      return Promise.resolve(_.isNaN(maxPrice) ? null : maxPrice);
    }),
  check('commissionRate').toFloat(),
  check('commissionPrice').toFloat()
];
