import { check } from 'express-validator/check';

export const createValidator = [
  check('startDate')
    .exists()
    .withMessage('required'),
  check('endDate')
    .exists()
    .withMessage('required')
    .custom((endDate, { req }) => {
      if (endDate < req.body.startDate) {
        throw new Error('End Date must be greater than start Date');
      }
      return Promise.resolve();
    })
];
