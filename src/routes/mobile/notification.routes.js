import Router from 'express';
import { get } from '@controllers/notification.controller';

const router = new Router();

router.route('/').get(get);

export default router;
