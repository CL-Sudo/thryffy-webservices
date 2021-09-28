import Router from 'express';
import { byCountryFilter, crud } from '@utils/controller-crud.util';
import { Banners } from '@models';
import { create } from '@controllers/Admin/banner.controller';

const controller = crud(Banners);

const router = new Router();

router
  .route('/')
  .get(byCountryFilter(controller.read))
  .post(create);

router
  .route('/:id')
  .delete(controller.destroy({ force: true }))
  .get(controller.readOne);

export default router;
