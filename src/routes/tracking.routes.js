import Router from 'express';
import { getTrackingDataRequest } from '@controllers/tracking.controller';

const router = new Router();

router.route('/result').get(getTrackingDataRequest);

export default router;
