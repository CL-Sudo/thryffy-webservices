import Router from 'express';
import { crud } from '@utils/controller-crud.util';
import { Products } from '@models';
import { addProduct, updateProduct } from '@controllers/seller.controller';
import { managePublication } from '@controllers/Admin/products.controller';

const controller = crud(Products);

const router = new Router();

router
  .route('/')
  .get(controller.read)
  .post(addProduct);

router
  .route('/:id')
  .get(controller.readOne)
  .delete(controller.destroy)
  .put(updateProduct);

router.route('/:productId/publications').patch(managePublication);

export default router;
