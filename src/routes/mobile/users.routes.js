import Router from 'express';
import { search } from '@controllers/users.controller';
import { searchValidator } from '@validators/users.validator';

const router = new Router();

router.get('/search', searchValidator, search);

export default router;
