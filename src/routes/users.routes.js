import Router from 'express';
import passport from 'passport';
import * as Config from '@configs';
import { Users } from '@models';
import { crud } from '@utils/controller-crud.util';

const controller = crud(Users);

const router = new Router();

const adminPassportMiddleware = passport.authenticate(Config.passport.strategy.dashboard, {
  session: false
});

router.patch('/activate/:id', adminPassportMiddleware, controller.activate);
router.patch('/deactivate/:id', adminPassportMiddleware, controller.deactivate);

export default router;
