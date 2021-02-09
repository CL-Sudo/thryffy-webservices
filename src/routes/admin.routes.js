import Router from 'express';
import passport from 'passport';
import * as Config from '@configs';
import { create, adminChangePassword, updateAdmin } from '@controllers/Admin/admins.controller';
import { crud } from '@utils/controller-crud.util';
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
  .get(adminPassportMiddleware, controller.read)
  .patch(adminPassportMiddleware, changePasswordValidator, adminChangePassword);

router
  .route('/:id')
  .get(adminPassportMiddleware, controller.readOne)
  .delete(adminPassportMiddleware, controller.destroy)
  .put(adminPassportMiddleware, updateAdmin);

router.patch('/activate/:id', adminPassportMiddleware, controller.activate);
router.patch('/deactivate/:id', adminPassportMiddleware, controller.deactivate);

export default router;
