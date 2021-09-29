import Router from 'express';
import { byCountryFilter, crud } from '@utils/controller-crud.util';
import CommissionFreeCampaigns from '@models/commission_free_campaigns.model';
import { createValidator } from '@validators/Admin/commission_free_campaign.validator';

const controller = crud(CommissionFreeCampaigns);

const router = new Router();

router
  .route('/')
  .get(byCountryFilter(controller.read))
  .post(createValidator, controller.create);

router
  .route('/:id')
  .get(byCountryFilter(controller.readOne))
  .put(createValidator, controller.update)
  .delete(byCountryFilter(controller.destroy()));

export default router;
