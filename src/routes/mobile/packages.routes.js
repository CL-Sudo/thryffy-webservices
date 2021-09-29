import Router from 'express';
import { Packages } from '@models';
import { byCountryFilter, crud } from '@utils/controller-crud.util';

const controller = crud(Packages);

const router = new Router();

router.route('/').get(byCountryFilter(controller.read));

export default router;
