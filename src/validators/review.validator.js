import { check } from 'express-validator/check';
import { SalesOrders, Reviews } from '@models';
import R from 'ramda';

export const createValidator = [
  check('orderId')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required')
    .custom(async (orderId, { req }) => {
      const { id } = req.user;

      const order = await SalesOrders.findOne({
        where: { id: orderId }
      });

      if (R.isNil(order)) {
        throw new Error('Invalid orderId given.');
      }

      if (order.userId !== id) {
        throw new Error("This order's item does not belong to this user");
      }

      const review = await Reviews.findOne({ where: { orderId } });
      if (!R.isNil(review)) throw new Error('This order has been rated');

      return Promise.resolve();
    }),
  check('rating')
    .exists()
    .withMessage('Required')
];
