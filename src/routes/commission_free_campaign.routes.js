import Router from 'express';
import { crud } from '@utils/controller-crud.util';
import CommissionFreeCampaigns from '@models/commission_free_campaigns.model';
import { createValidator } from '@validators/Admin/commission_free_campaign.validator';

const controller = crud(CommissionFreeCampaigns);

const router = new Router();

router
  .route('/')
  .get(controller.read)
  .post(createValidator, controller.create);

router
  .route('/:id')
  .get(controller.readOne)
  .put(createValidator, controller.update)
  .delete(controller.destroy);

export default router;
