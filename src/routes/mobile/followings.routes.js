import Router from 'express';
import { follow, unfollow, list } from '@controllers/followings.controller';

const router = new Router();

router.route('/').post(follow);

router
  .route('/:id')
  .delete(unfollow)
  .get(list);

export default router;
