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
      req.body.countryId = req.user.countryId;
      return Promise.resolve();
    })
];
