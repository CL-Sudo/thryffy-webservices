import Router from 'express';
import { sendEnquiry } from '@controllers/contact_us.controller';

const router = new Router();

router.post('/', sendEnquiry);

export default router;
