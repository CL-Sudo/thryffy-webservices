import Router from 'express';
import { create, respond, getDispute } from '@controllers/dispute.controller';
import { crud } from '@utils/controller-crud.util';
import { Disputes } from '@models';

const controller = crud(Disputes);

const router = new Router();

router.post('/', create);
router.post('/respond', respond);
router.get('/:orderId', getDispute);

export default router;
