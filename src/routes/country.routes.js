import Countries from '@models/countries.model';
import crud from '@utils/controller-crud.util';
import Router from 'express';
import { create, update } from '@controllers/Admin/country.controller';
import { multerMiddleware } from '@middlewares/multer.middleware';

const controller = crud(Countries);

const router = new Router();

router
  .route('/:id')
  .get(controller.readOne)
  .put(multerMiddleware, update)
  .delete(controller.destroy({ force: true }));

router
  .route('/')
  .get(controller.read)
  .post(multerMiddleware, create);

export default router;
