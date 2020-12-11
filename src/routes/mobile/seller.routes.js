import Router from 'express';
import {
  addProduct,
  getProductShippingFee,
  markAsShipped,
  getProducts,
  getSellerDetail
} from '@controllers';
import { markAsShippedValidator, getShippingFeeValidator } from '@validators/seller.validator';

const router = new Router();

router.post('/product', addProduct);
router.get('/shipping-fee', getShippingFeeValidator, getProductShippingFee);
router.patch('/mark-as-shipped', markAsShippedValidator, markAsShipped);

router.get('/products', getProducts);

router.get('/', getSellerDetail);

export default router;
