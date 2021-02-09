import Router from 'express';
import { get, getUnreadNotification, setToIsRead } from '@controllers/notification.controller';

const router = new Router();

router.route('/').get(get);
router.get('/unread/count', getUnreadNotification);

router.patch('/set-is-read', setToIsRead);

export default router;
