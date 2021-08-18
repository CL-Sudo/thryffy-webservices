import {
  addCommissionRate,
  destroy,
  updateCommissionRate
} from '@controllers/Admin/commissions.controller';
import Router from 'express';
import { crud } from '@utils/controller-crud.util';
import Commissions from '@models/commission.model';
import { addCommissionValidator } from '@validators/Admin/commissions.validator';

const controller = crud(Commissions);

const router = new Router();

router.post('/', addCommissionValidator, addCommissionRate);
router.get('/', controller.read);
router.get('/:id', controller.readOne);
router.delete('/:id', destroy);
router.put('/:id', addCommissionValidator, updateCommissionRate);

export default router;
