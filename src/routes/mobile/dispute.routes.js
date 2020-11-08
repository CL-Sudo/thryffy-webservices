import Router from 'express';
import { create, respond } from '@controllers/dispute.controller';

const router = new Router();

router.post('/:orderId', create);
router.post('/respond/:disputeId', respond);

export default router;
