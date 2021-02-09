import Router from 'express';
import { subscribe, get } from '@controllers/subscription.controller';
import { subscribeValidator } from '@validators/subscription.validator';

const router = new Router();

router
  .route('/')
  .post(subscribeValidator, subscribe)
  .get(get);

export default router;
