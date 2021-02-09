import Router from 'express';
import { getSizes } from '@controllers/sizes.controller';

const router = new Router();

router.get('/', getSizes);

export default router;
