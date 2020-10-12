import Router from 'express';
import { crud } from '@utils/controller-crud.util';
import { Sizes } from '@models';
import { create } from '@controllers/Admin/sizes.controller';
import { createValidator, updateValidator } from '@validators/Admin/sizes.validator';
import { requestValidator } from '@validators';

const controller = crud(Sizes);

const router = new Router();

router
  .route('/')
  .get(controller.read)
  .post(createValidator, create);

router
  .route('/:id')
  .get(controller.readOne)
  .delete(controller.destroy)
  .put(
    updateValidator,
    (req, _, done) => {
      try {
        requestValidator(req);
        return done();
      } catch (e) {
        return done(e);
      }
    },
    controller.update
  );

export default router;
