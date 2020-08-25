import { check } from 'express-validator/check';
import { SalesOrders, OrderItems, Reviews } from '@models';
import R from 'ramda';

export const createValidator = [
  check('orderItemId')
    .exists()
    .withMessage('Required')
    .custom(async (orderItemId, { req }) => {
      if (R.isNil(orderItemId)) {
        throw new Error('Required');
      }
      const { id } = req.user;
      const orderItem = await OrderItems.findOne({
        include: [{ model: SalesOrders, as: 'order' }],
        where: { id: orderItemId }
      });
      if (R.isNil(orderItem)) {
        throw new Error('Invalid orderItemId given.');
      }
      if (orderItem.order.userId !== id) {
        throw new Error("This order's item does not belong to this user");
      }
      const review = await Reviews.findOne({ where: { orderItemId } });
      if (R.not(R.isNil(review))) {
        throw new Error('This item has already been reviewed!');
      }
      return Promise.resolve();
    }),
  check('rating')
    .exists()
    .withMessage('Required')
];
