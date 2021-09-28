import Router from 'express';

import { MarketingNotifications } from '@models';

import { byCountryFilter, crud } from '@utils/controller-crud.util';

import { create } from '@controllers/notification.controller';

const controller = crud(MarketingNotifications);

const router = new Router();

router
  .route('/')
  .get(byCountryFilter(controller.read))
  .post(create);

router
  .route('/:id')
  .get(byCountryFilter(controller.readOne))
  .delete(byCountryFilter(controller.destroy({ force: true })));

export default router;
