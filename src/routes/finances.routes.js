import Router from 'express';
import { crud } from '@utils/controller-crud.util';
import { SalesOrders } from '@models';

const controller = crud(SalesOrders);
const router = new Router();

router.route('/').get(controller.read);

router
  .route('/:id')
  .get(controller.readOne)
  .delete(controller.destroy)
  .put(controller.update);

export default router;
