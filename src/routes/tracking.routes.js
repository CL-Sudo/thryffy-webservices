import Router from 'express';
import { getTrackingInfoByOrderId } from '@controllers/tracking.controller';

const router = new Router();

router.route('/:orderId/result', getTrackingInfoByOrderId);
export default router;
