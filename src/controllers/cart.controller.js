import { CartItems, Products, Users } from '@models';
import R from 'ramda';

export const list = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const { id } = req.user;

    const cart = await CartItems.findAll({
      attributes: ['productId'],
      raw: true,
      where: {
        userId: id
      }
    });

    const productIds = R.map(R.prop('productId'))(cart);

    const payload = await Users.scope({ method: ['cart', productIds] }).findAndCountAll({
      limit: Number(limit) || null,
      offset: Number(offset) || null
    });

    return res.status(200).json({
      message: 'success',
      payload
    });
  } catch (e) {
    return next(e);
  }
};

export const add = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { productId } = req.body;

    const checkProductIdValidity = async () => {
      try {
        const product = await Products.findOne({
          raw: true,
          where: { id: productId }
        });
        if (R.isNil(product)) {
          throw new Error('Invalid productId given');
        }
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const checkIsItemExisted = async () => {
      try {
        const cartItem = await CartItems.findOne({
          raw: true,
          where: {
            productId
          }
        });
        if (R.not(R.isNil(cartItem))) {
          throw new Error('This item is already in your bag');
        }
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const addToCart = async () => {
      try {
        await CartItems.create({
          userId: id,
          productId
        });
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    };

    await R.pipeP(checkProductIdValidity, checkIsItemExisted, addToCart)();

    return res.status(200).json({
      message: 'success'
    });
  } catch (e) {
    return next(e);
  }
};

export const deleteOne = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { productId } = req.params;

    const item = await CartItems.findOne({
      where: {
        userId: id,
        productId
      }
    });

    if (R.isNil(item)) {
      throw new Error('Invalid productId given, no item found');
    }

    item.destroy({ force: true });

    return res.status(200).json({
      message: 'success'
    });
  } catch (e) {
    return next(e);
  }
};
