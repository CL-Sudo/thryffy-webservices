import { check } from 'express-validator/check';

export const searchValidator = [
  check('keyword')
    .exists()
    .withMessage('Required')
];
