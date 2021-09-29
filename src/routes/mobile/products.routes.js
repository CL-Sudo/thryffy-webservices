import Router from 'express';
import * as controllers from '@controllers/product.controller';
import { byCountryFilter } from '@utils/controller-crud.util';

const router = new Router();

router.get('/:productId', byCountryFilter(controllers.getOne));

router.get('/:productId/recommendations', controllers.youMayAlsoLike);

export default router;
