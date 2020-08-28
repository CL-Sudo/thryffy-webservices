import Router from 'express';
import * as controllers from '@controllers/cart.controller';
import { payValidator, checkoutValidator } from '@validators';

const router = new Router();

router.get('/', controllers.list);
router.post('/', controllers.add);
router.delete('/:productId', controllers.deleteOne);

router.get('/checkout', checkoutValidator, controllers.checkout);
router.post('/pay', payValidator, controllers.pay);

export default router;
