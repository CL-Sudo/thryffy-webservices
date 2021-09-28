import Router from 'express';

import { crud } from '@utils/controller-crud.util';

import { Comments } from '@models';

import { list } from '@controllers/Admin/comments.controller';

const controller = crud(Comments);

const router = new Router();

router
  .route('/:id')
  .get(list)
  .delete(controller.destroy());

export default router;
