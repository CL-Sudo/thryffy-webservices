import Router from 'express';
import { create } from '@controllers/Admin/feature_item.controller';
import { crud } from '@utils/controller-crud.util';
import { FeatureItems } from '@models';

const controller = crud(FeatureItems);

const router = new Router();

router
  .route('/')
  .post(create)
  .get(controller.read);

router
  .route('/:id')
  .get(controller.readOne)
  .delete(controller.destroy)
  .put(async (req, res, next) => {
    try {
      const { productId } = req.body;
      const { id } = req.params;
      const featureItem = await FeatureItems.findOne({ where: { id } });
      if (!featureItem) throw new Error('Invalid id given');
      await featureItem.update({ productId });
      await featureItem.reload();

      return res.status(200).json({ message: 'success', payload: featureItem });
    } catch (e) {
      return next(e);
    }
  });

export default router;
