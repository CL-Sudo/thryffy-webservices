import { check } from 'express-validator/check';
import { Products, FavouriteProducts, CartItems } from '@models';
import R from 'ramda';

export const moveToBagValidator = [
  check('productId')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Required')
    .custom(async (productId, { req }) => {
      const { id } = req.user;
      const product = await Products.scope([{ method: ['byCountry', req.user.countryId] }]).findOne(
        {
          raw: true,
          where: { id: productId }
        }
      );
      if (R.isNil(product)) throw new Error('Invalid productId given.');

      if (product.userId === id) throw new Error('You cannot add your own product to bag');

      const favourite = await FavouriteProducts.findOne({
        raw: true,
        where: { productId, userId: id }
      });

      if (R.isNil(favourite)) throw new Error('This item is not in the favourite list');

      const cartItem = await CartItems.findOne({
        raw: true,
        where: { userId: id, productId }
      });

      if (!R.isNil(cartItem)) throw new Error('This item is already in your cart');

      return Promise.resolve();
    })
];
