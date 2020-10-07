import Router from 'express';
import { list, getSizes } from '@controllers/categories.controller';
import { listValidator } from '@validators/categories.validator';

const router = new Router();

router.get('/', listValidator, list);
router.get('/sizes/:categoryId', getSizes);

export default router;
