import Router from 'express';
import { byCountryFilter, crud } from '@utils/controller-crud.util';
import { Users } from '@models';
import {
  list,
  getCustomerProductRequest,
  deleteCustomer,
  getOneCustomer,
  updatePackage
} from '@controllers/Admin/customers.controller';

const controller = crud(Users);

const router = new Router();

router.route('/').get(list);

router
  .route('/:id')
  .get(getOneCustomer)
  .delete(deleteCustomer);

router.route('/:id/products').get(getCustomerProductRequest);

router.route('/activate/:id').patch(byCountryFilter(controller.activate));
router.route('/deactivate/:id').patch(byCountryFilter(controller.deactivate));

router.patch('/:userId/package', updatePackage);

export default router;
