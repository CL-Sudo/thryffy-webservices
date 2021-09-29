import Router from 'express';
import { byCountryFilter, crud } from '@utils/controller-crud.util';
import { Categories } from '@models';
import { create, update } from '@controllers/Admin/categories.controller';

const controller = crud(Categories);

const router = new Router();

router
  .route('/')
  .get(byCountryFilter(controller.read))
  .post(create);

router
  .route('/:id')
  .get(byCountryFilter(controller.readOne))
  .delete(byCountryFilter(controller.destroy({ force: true })))
  .put(update);

router.route('/activate/:id').patch(byCountryFilter(controller.activate));
router.route('/deactivate/:id').patch(byCountryFilter(controller.deactivate));

export default router;
