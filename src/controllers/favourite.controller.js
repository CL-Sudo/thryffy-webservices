import R from 'ramda';
import { FavouriteProducts, Users, Products } from '@models';

export const list = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { limit, offset } = req.query;

    const favourites = await FavouriteProducts.findAll({
      raw: true,
      attributes: ['productId'],
      where: { userId: id }
    });

    const productIds = R.map(R.prop('productId'), favourites);

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

export const remove = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { id } = req.user;

    const favourite = await FavouriteProducts.findOne({
      where: { productId, userId: id }
    });

    if (R.isNil(favourite)) {
      throw new Error('This product is not in the favourite list');
    }

    favourite.destroy({ force: true });

    return res.status(200).json({
      message: 'success'
    });
  } catch (e) {
    return next(e);
  }
};

export const add = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const { id } = req.user;

    const product = await Products.findOne({
      raw: true,
      where: { id: productId }
    });

    if (R.isNil(product)) {
      throw new Error('Invalid product id given, product not found.');
    }

    const favouriteList = await FavouriteProducts.findOne({
      where: {
        userId: id,
        productId
      }
    });

    if (R.not(R.isNil(favouriteList))) {
      throw new Error('This item is already in your favourite list.');
    }

    await FavouriteProducts.create({
      productId,
      userId: id
    });
    return res.status(200).json({ message: 'success' });
  } catch (e) {
    return next(e);
  }
};
