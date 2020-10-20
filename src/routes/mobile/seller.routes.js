import Router from 'express';
import { addProduct, getProductShippingFee, markAsShipped, updateTrackingNo } from '@controllers';
import { markAsShippedValidator, getShippingFeeValidator } from '@validators/seller.validator';

const router = new Router();

router.post('/product', addProduct);
router.get('/shipping-fee', getShippingFeeValidator, getProductShippingFee);
router.patch('/mark-as-shipped', markAsShippedValidator, markAsShipped);
router.patch('/tracking-no', updateTrackingNo);

export default router;
