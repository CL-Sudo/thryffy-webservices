import Router from 'express';
import * as controllers from '@controllers/product.controller';

const router = new Router();

router.get('/:productId', controllers.getOne);

router.get('/:productId/recommendations', controllers.youMayAlsoLike);

export default router;
