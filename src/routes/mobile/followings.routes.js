import Router from 'express';
import { follow, unfollow, list } from '@controllers/followings.controller';

const router = new Router();

router
  .route('/')
  .post(follow)
  .get(list);

router.route('/:sellerId').delete(unfollow);

export default router;
