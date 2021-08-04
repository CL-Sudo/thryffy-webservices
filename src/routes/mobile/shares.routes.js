import Router from 'express';
import { shareProduct } from '@controllers/share.controller';

const router = new Router();

router.get('/product/:productId', shareProduct);

export default router;
