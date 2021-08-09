import Router from 'express';
import { shareProduct, shareProfile } from '@controllers/share.controller';

const router = new Router();

router.get('/product/:productId', shareProduct);
router.get('/profile/:userId', shareProfile);

export default router;
