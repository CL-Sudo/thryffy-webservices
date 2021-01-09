import Router from 'express';

import { createValidator } from '@validators/comments.validator';

import { create, list } from '@controllers/comments.controller';

const router = new Router();

router
  .route('/:productId')
  .post(createValidator, create)
  .get(list);

export default router;
