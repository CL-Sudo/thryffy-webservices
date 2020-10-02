import Router from 'express';
import { crud } from '@utils/controller-crud.util';
import { Categories } from '@models';
import { create, update } from '@controllers/Admin/categories.controller';

const controller = crud(Categories);

const router = new Router();

router
  .route('/')
  .get(controller.read)
  .post(create);

router
  .route('/:id')
  .get(controller.readOne)
  .delete(controller.destroy)
  .put(update);

router.route('/activate/:id').patch(controller.activate);
router.route('/deactivate/:id').patch(controller.deactivate);

export default router;
