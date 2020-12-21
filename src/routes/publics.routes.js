import Router from 'express';
import {
  billplzCallback,
  subscribeCallback,
  subscriptionRedirect,
  billplzRedirect
} from '@controllers/public.controller';

const router = new Router();

router.route('/billplz/callback').post(billplzCallback);
router.route('/billplz/redirect').get(billplzRedirect);

router.route('/subscriptions/callback').post(subscribeCallback);
router.route('/subscriptions/redirect').get(subscriptionRedirect);

export default router;
