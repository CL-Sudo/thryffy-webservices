import { check } from 'express-validator/check';
import { removeRepeatedWhiteSpace } from '@validators';
import _ from 'lodash';

const identityOrDefault = (val, def) => {
  if (_.toUpper(val) === 'ALL') return def;
  if (val && _.size(val) > 0) return removeRepeatedWhiteSpace(val);
  return def;
};

const parseOrder = val => {
  if (val && _.size(val) > 0) {
    if (_.toUpper(val) !== 'ASC' && _.toUpper(val) !== 'DESC' && _.toUpper(val) !== 'RELEVANCE') {
      return 'DESC';
    }
    return _.toUpper(val);
  }
  return 'DESC';
};

export const homeValidator = [
  check('type')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required')
    .trim()
    .custom(type => {
      const normalized = _.toUpper(type);
      if (normalized !== 'MEN' && normalized !== 'WOMEN' && normalized !== 'KIDS') {
        throw new Error('It must be either men, women or kids');
      }
      return Promise.resolve();
    })
    .customSanitizer(type => _.upperFirst(_.toLower(removeRepeatedWhiteSpace(type))))
];

export const listValidator = [
  check('categoryId').customSanitizer(categoryId => identityOrDefault(categoryId, null)),
  check('limit').customSanitizer(limit => (limit ? Number(limit) : null)),
  check('offset').customSanitizer(offset => (offset ? Number(offset) : null)),
  check('minPrice')
    .trim()
    .customSanitizer(minPrice => identityOrDefault(minPrice, 1)),
  check('maxPrice').customSanitizer(maxPrice => identityOrDefault(maxPrice, 900)),
  check('brand')
    .trim()
    .customSanitizer(brand => identityOrDefault(brand, null)),
  check('conditionId')
    .trim()
    .customSanitizer(conditionId => identityOrDefault(conditionId, null)),
  check('size')
    .trim()
    .customSanitizer(size => identityOrDefault(size, null)),
  check('keyword')
    .trim()
    .customSanitizer(keyword => identityOrDefault(keyword, null)),
  check('order')
    .trim()
    .customSanitizer(order => parseOrder(order))
];

export const searchBrandValidator = [
  check('keyword')
    .exists()
    .withMessage('Required')
    .trim()
    .customSanitizer(keyword => identityOrDefault(keyword, null)),
  check('limit').customSanitizer(limit => (limit ? Number(limit) : null)),
  check('offset').customSanitizer(offset => (offset ? Number(offset) : null))
];

export const searchItemValidator = [
  check('keyword')
    .withMessage('Required')
    .whitelist('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ')
    .trim()
    .customSanitizer(keyword => _.toLower(removeRepeatedWhiteSpace(keyword)))
];

export const autocompleteValidator = [
  check('keyword')
    .exists()
    .withMessage('Required')
    .whitelist('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ')
    .trim()
    .customSanitizer(keyword => _.toLower(removeRepeatedWhiteSpace(keyword))),
  check('limit').customSanitizer(limit => (limit ? Number(limit) : null)),
  check('offset').customSanitizer(offset => (offset ? Number(offset) : null))
];
