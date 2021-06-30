import Router from 'express';
import * as controllers from '@controllers/review.controller';
import { createValidator } from '@validators/review.validator';

const router = new Router();

router.post('/', createValidator, controllers.create);

export default router;
