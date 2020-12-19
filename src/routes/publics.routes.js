import Router from 'express';
import {
  billplzCallback,
  subscribeCallback,
  billplzRedirect
} from '@controllers/public.controller';

const router = new Router();

router.route('/billplz/callback').post(billplzCallback);
router.route('/billplz/redirect').get(billplzRedirect);

router.route('/subscriptions/callback').post(subscribeCallback);

export default router;
