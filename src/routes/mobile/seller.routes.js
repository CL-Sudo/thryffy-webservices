import Router from 'express';
import {
  addProduct,
  getProductShippingFee,
  markAsShipped,
  getProducts,
  getSellerDetail,
  getSellerReviews,
  updateProduct
} from '@controllers/seller.controller';
import { markAsShippedValidator, getShippingFeeValidator } from '@validators/seller.validator';

const router = new Router();

router.post('/product', addProduct);
router.put('/product/:productId', updateProduct);
router.get('/shipping-fee', getShippingFeeValidator, getProductShippingFee);
router.patch('/mark-as-shipped', markAsShippedValidator, markAsShipped);

router.get('/:sellerId/products', getProducts);

router.get('/:sellerId/details', getSellerDetail);

router.get('/:sellerId/reviews', getSellerReviews);

export default router;
