import Router from 'express';
import * as controllers from '@controllers/favourite.controller';

const router = new Router();

router.get('/', controllers.list);
router.post('/', controllers.add);
router.delete('/:productId', controllers.remove);

export default router;
