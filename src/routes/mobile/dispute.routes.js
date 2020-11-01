import Router from 'express';
import { create } from '@controllers/dispute.controller';

const router = new Router();

router.post('/:orderId', create);

export default router;
