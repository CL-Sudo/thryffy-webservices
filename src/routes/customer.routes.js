import Router from 'express';
import { crud } from '@utils/controller-crud.util';
import { Users } from '@models';
import {
  list,
  getCustomerProductRequest,
  deleteCustomer
} from '@controllers/Admin/customers.controller';

const controller = crud(Users);

const router = new Router();

router.route('/').get(list);

router
  .route('/:id')
  .get(controller.readOne)
  .delete(deleteCustomer);

router.route('/:id/products').get(getCustomerProductRequest);

router.route('/activate/:id').patch(controller.activate);
router.route('/deactivate/:id').patch(controller.deactivate);

export default router;
