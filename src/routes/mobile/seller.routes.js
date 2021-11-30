import Router from 'express';
import {
  addProduct,
  getProductShippingFee,
  markAsShipped,
  getProducts,
  getSellerDetail,
  getSellerReviews,
  updateProduct,
  publication,
  getSellerCategories,
  getProductCommission,
  schedulePickupDelivery
} from '@controllers/seller.controller';
import { getShippingFeeValidator } from '@validators/seller.validator';
import { multerMiddleware } from '@middlewares/multer.middleware';

const router = new Router();

router.post('/product', addProduct);
router.put('/product/:productId', updateProduct);
router.patch('/product/:productId/publication', publication);
router.get('/shipping-fee', getShippingFeeValidator, getProductShippingFee);
router.patch('/mark-as-shipped', multerMiddleware, markAsShipped);
router.get('/product-commission', getProductCommission);
router.post('/schedule-pickup-delivery', schedulePickupDelivery);

router.get('/:sellerId/products', getProducts);
router.get('/:sellerId/details', getSellerDetail);
router.get('/:sellerId/reviews', getSellerReviews);
router.get('/:sellerId/categories', getSellerCategories);

export default router;
