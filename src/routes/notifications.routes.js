import Router from 'express';

import { MarketingNotifications } from '@models';

import { crud } from '@utils/controller-crud.util';

import { create } from '@controllers/notification.controller';

const controller = crud(MarketingNotifications);

const router = new Router();

router
  .route('/')
  .get(controller.read)
  .post(create);

router
  .route('/:id')
  .get(controller.readOne)
  .delete(controller.destroy({ force: true }));

export default router;
