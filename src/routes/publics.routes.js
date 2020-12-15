import Router from 'express';
import { billplzCallback } from '@controllers/public.controller';

const router = new Router();

router.route('/billplz/callback').post(billplzCallback);

export default router;
