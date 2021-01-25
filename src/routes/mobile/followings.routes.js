import Router from 'express';
import { follow, unfollow, listFollower, listFollowing } from '@controllers/followings.controller';

const router = new Router();

router.route('/').post(follow);

router
  .route('/:id')
  .delete(unfollow)
  .get(listFollowing);

router.route('/:id/followers').get(listFollower);

export default router;
