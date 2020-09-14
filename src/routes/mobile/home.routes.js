import Router from 'express';
import * as controllers from '@controllers/home.controller';

const router = new Router();

router.get('/', controllers.list);

export default router;
