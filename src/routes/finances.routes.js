import Router from 'express';
import { byCountryFilter, crud } from '@utils/controller-crud.util';
import { SalesOrders } from '@models';

const controller = crud(SalesOrders);
const router = new Router();

router.route('/').get(byCountryFilter(controller.read));

router
  .route('/:id')
  .get(byCountryFilter(controller.readOne))
  .delete(byCountryFilter(controller.destroy()))
  .put(byCountryFilter(controller.update));

export default router;
