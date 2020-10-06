import Router from 'express';
import { list, getRespectiveSizes } from '@controllers/categories.controller';
import { listValidator } from '@validators/categories.validator';

const router = new Router();

router.get('/', listValidator, list);
router.get('/sizes/:categoryId', getRespectiveSizes);

export default router;
