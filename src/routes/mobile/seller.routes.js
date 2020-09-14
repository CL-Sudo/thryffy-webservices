import Router from 'express';
import { addProduct, getProductShippingFee } from '@controllers';

const router = new Router();

router.post('/product', addProduct);
router.get('/shipping-fee', getProductShippingFee);

export default router;
