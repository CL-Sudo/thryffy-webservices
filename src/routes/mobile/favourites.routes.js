import Router from 'express';
import * as controllers from '@controllers/favourite.controller';
import { moveToBagValidator } from '@validators/favourites.validator';

const router = new Router();

router.get('/', controllers.list);
router.post('/', controllers.add);
router.delete('/:productId', controllers.remove);

router.post('/move-to-bag', moveToBagValidator, controllers.moveToBag);

export default router;
