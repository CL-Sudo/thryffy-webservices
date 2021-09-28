import Router from 'express';
import { crud } from '@utils/controller-crud.util';
import { Products } from '@models';
import { addProduct, updateProduct } from '@controllers/seller.controller';
import {
  managePublication,
  verifyProductRequest,
  unVerifyProductRequest,
  getProductListRequest
} from '@controllers/Admin/products.controller';

const controller = crud(Products);

const router = new Router();

router
  .route('/')
  .get(getProductListRequest)
  .post(addProduct);

router
  .route('/:id')
  .get(controller.readOne)
  .delete(controller.destroy())
  .put(updateProduct);

router.route('/:productId/publications').patch(managePublication);

router.route('/:productId/verify').patch(verifyProductRequest);
router.route('/:productId/un-verify').patch(unVerifyProductRequest);

export default router;
