import Router from 'express';
import { crud } from '@utils/controller-crud.util';
import { Banners } from '@models';
import { create } from '@controllers/Admin/banner.controller';

const controller = crud(Banners);

const router = new Router();

router
  .route('/')
  .get(controller.read)
  .post(create);

router
  .route('/:id')
  .delete(controller.destroy)
  .get(controller.readOne);

export default router;
