import Router from 'express';
import { exportOrderToExcel } from '@controllers/Admin/reports.controller';

const router = new Router();

router.get('/orders', exportOrderToExcel);

export default router;
