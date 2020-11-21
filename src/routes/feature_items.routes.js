import Router from 'express';
import { create } from '@controllers/Admin/feature_item.controller';
import { crud } from '@utils/controller-crud.util';
import { FeatureItems } from '@models';

const controller = crud(FeatureItems);

const router = new Router();

router
  .route('/')
  .post(create)
  .get(controller.read);

router
  .route('/:id')
  .get(controller.readOne)
  .delete(controller.destroy);

export default router;
