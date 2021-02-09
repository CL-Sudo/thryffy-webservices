import Router from 'express';

import { crud } from '@utils/controller-crud.util';

import { Conditions } from '@models';

const controller = crud(Conditions);

const router = new Router();

router.route('/').get(controller.read);

export default router;
