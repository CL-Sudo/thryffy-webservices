import Router from 'express';
import { list } from '@controllers/categories.controller';
import { listValidator } from '@validators/categories.validator';

const router = new Router();

router.get('/', listValidator, list);

export default router;
