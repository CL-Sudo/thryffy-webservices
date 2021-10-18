import Countries from '@models/countries.model';
import crud from '@utils/controller-crud.util';
import Router from 'express';
import { create, update } from '@controllers/Admin/country.controller';
import { multerMiddleware } from '@middlewares/multer.middleware';
import passport from 'passport';
import * as Config from '@configs';

const controller = crud(Countries);

const router = new Router();

const adminAuth = passport.authenticate(Config.passport.strategy.dashboard, { session: false });

router
  .route('/:id')
  .get(controller.readOne)
  .put(adminAuth, multerMiddleware, update)
  .delete(adminAuth, controller.destroy({ force: true }));

router
  .route('/')
  .get(controller.read)
  .post(adminAuth, multerMiddleware, create);

export default router;
