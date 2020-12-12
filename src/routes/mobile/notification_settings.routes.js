import Router from 'express';

import { getOne, update } from '@controllers/notification_settings.controller';

const router = new Router();

router
  .route('/')
  .get(getOne)
  .put(update);

export default router;
