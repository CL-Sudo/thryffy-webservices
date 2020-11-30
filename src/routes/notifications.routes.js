import Router from 'express';

import { Notifications } from '@models';

import { crud } from '@utils/controller-crud.util';

import { create } from '@controllers/notification.controller';

const controller = crud(Notifications);

const router = new Router();

router
  .route('/')
  .get(controller.read)
  .post(create);

router
  .route('/:id')
  .get(controller.readOne)
  .delete(controller.destroy);

export default router;
