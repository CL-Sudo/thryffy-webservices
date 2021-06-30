import Router from 'express';
import { list, getDefaultSize } from '@controllers/categories.controller';
import { listValidator } from '@validators/categories.validator';

const router = new Router();

router.get('/', listValidator, list);
router.get('/:categoryId/default-size', getDefaultSize);

export default router;
