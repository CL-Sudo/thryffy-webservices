import Router from 'express';
import { Packages } from '@models';
import { crud } from '@utils/controller-crud.util';

const controller = crud(Packages);

const router = new Router();

router.route('/').get(controller.read);

export default router;
