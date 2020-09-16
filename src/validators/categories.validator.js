import { check } from 'express-validator/check';
import R from 'ramda';
import { Categories } from '@models';

const identityOrDefault = (param, def) => {
  if (R.length(param) === 0) return def;
  return R.toUpper(param);
};

export const listValidator = [
  check('parent')
    .exists()
    .withMessage('Required')
    .custom(parent => {
      const isMen = R.toUpper(parent) === 'MEN';
      const isWomen = R.toUpper(parent) === 'WOMEN';
      const isKids = R.toUpper(parent) === 'KIDS';

      if (!isMen && !isWomen && !isKids) {
        throw new Error('Invalid');
      }

      return Promise.resolve();
    })
    .customSanitizer(parent => identityOrDefault(parent, 'WOMEN')),
  check('childId')
    .exists()
    .withMessage('Required')
    .custom(async childId => {
      if (childId) {
        const result = await Categories.findOne({
          where: { id: childId }
        });
        if (R.isNil(result)) throw new Error('Invalid childId given');
      }

      return Promise.resolve();
    })
    .customSanitizer(child => {
      const isString = R.type(child) === 'String';
      if (isString && R.length(child) === 0) {
        return null;
      }
      return child;
    }),
  check('limit').customSanitizer(limit => (limit ? Number(limit) : null)),
  check('offset').customSanitizer(offset => (offset ? Number(offset) : null))
];
