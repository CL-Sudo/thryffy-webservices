import { check } from 'express-validator/check';
import TYPE from '@constants/size.constant';
import { removeRepeatedWhiteSpace } from '@validators';

export const createValidator = [
  check('type')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required')
    .trim()
    .customSanitizer(type => removeRepeatedWhiteSpace(String.prototype.toUpperCase.call(type)))
    .custom(type => {
      if (
        !Object.keys(TYPE)
          .map(t => TYPE[t])
          .includes(type)
      ) {
        throw new Error('Invalid type given');
      }

      return Promise.resolve();
    }),

  check('international')
    .trim()
    .customSanitizer(international => String.prototype.toUpperCase.call(international)),
  check('us').trim(),
  check('uk').trim(),
  check('eu').trim(),
  check('waistSize').trim(),
  check('age').trim(),
  check('height').trim()
];

export const updateValidator = createValidator;
