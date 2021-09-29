import { check } from 'express-validator/check';

import { Products, OrderItems, SalesOrders } from '@models';

export const createValidator = [
  check('productId')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required')
    .custom(async (productId, { req }) => {
      try {
        const product = await Products.scope([
          { method: ['byCountry', req.user.countryId] }
        ]).findOne({
          where: { id: productId },
          include: [
            { model: OrderItems, as: 'item', include: [{ model: SalesOrders, as: 'order' }] }
          ]
        });
        if (!product) throw new Error('Invalid productId given');

        // if (product.item) {
        //   if (product.item.order) {
        //     if (product.item.order.userId !== req.user.id) {
        //       throw new Error('You cannot comment on this product');
        //     }
        //   }
        // } else {
        //   throw new Error('This item has not been sold yet.');
        // }

        // if (product.comment) {
        //   throw new Error('You cannot comment twice.');
        // }

        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    }),

  check('comment')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required')
];
