import Router from 'express';
import * as controllers from '@controllers/cart.controller';

const router = new Router();

router.get('/', controllers.list);
router.post('/', controllers.add);
router.delete('/:productId', controllers.deleteOne);

export default router;
