import Router from 'express';
import * as controllers from '@controllers/cart.controller';
import { payValidator, checkoutValidator, saveForLaterValidator } from '@validators';

const router = new Router();

router.get('/', controllers.list);
router.post('/', controllers.add);
router.delete('/:productId', controllers.deleteOne);

router.post('/checkout', checkoutValidator, controllers.checkout);
router.post('/pay', payValidator, controllers.pay);
router.post('/save-for-later', saveForLaterValidator, controllers.saveForLater);

export default router;
