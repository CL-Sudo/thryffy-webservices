import Router from 'express';
import passport from 'passport';
import * as Config from '@configs';
import { create, adminChangePassword, updateAdmin } from '@controllers/Admin/admins.controller';
import { byCountryFilter, crud } from '@utils/controller-crud.util';
import { Admins } from '@models';
import { changePasswordValidator, createValidator } from '@validators/Admin/admins.validator';

const controller = crud(Admins);

const adminPassportMiddleware = passport.authenticate(Config.passport.strategy.dashboard, {
  session: false
});

const router = new Router();

router
  .route('/')
  .post(adminPassportMiddleware, createValidator, create)
  .get(adminPassportMiddleware, byCountryFilter(controller.read))
  .patch(adminPassportMiddleware, changePasswordValidator, adminChangePassword);

router
  .route('/:id')
  .get(adminPassportMiddleware, byCountryFilter(controller.readOne))
  .delete(adminPassportMiddleware, byCountryFilter(controller.destroy()))
  .put(adminPassportMiddleware, updateAdmin);

router.patch('/activate/:id', adminPassportMiddleware, byCountryFilter(controller.activate));
router.patch('/deactivate/:id', adminPassportMiddleware, byCountryFilter(controller.deactivate));

export default router;
