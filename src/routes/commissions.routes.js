import { addCommissionRate, updateCommissionRate } from '@controllers/Admin/commissions.controller';
import Router from 'express';
import { byCountryFilter, crud } from '@utils/controller-crud.util';
import Commissions from '@models/commission.model';
import { addCommissionValidator } from '@validators/Admin/commissions.validator';

const controller = crud(Commissions);

const router = new Router();

router.post('/', addCommissionValidator, addCommissionRate);
router.get('/', byCountryFilter(controller.read));
router.get('/:id', byCountryFilter(controller.readOne));
router.delete('/:id', byCountryFilter(controller.destroy({ force: true })));
router.put('/:id', addCommissionValidator, updateCommissionRate);

export default router;
