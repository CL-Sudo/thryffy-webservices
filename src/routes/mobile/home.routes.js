import Router from 'express';
import { getCuratedList } from '@controllers/home.controller';

const router = new Router();

router.route('/').get(getCuratedList);

export default router;
