import Router from 'express';
import { create, respond, getDispute, getResponse } from '@controllers/dispute.controller';

const router = new Router();

router.post('/', create);
router.post('/respond', respond);
router.get('/:orderId', getDispute);
router.get('/:orderId/dispute-response', getResponse);

export default router;
