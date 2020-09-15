import { Products, FavouriteProducts } from '@models';
import R from 'ramda';

export const getOne = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { productId } = req.params;
    const product = await Products.scope({ method: ['productPage', productId] }).findOne();

    await product.getFavouriteCount();
    await product.checkIsAddedToFavourite(id);

    if (product.userId !== id) {
      product.increment('viewCount');
      await product.reload();
    }

    /**
     * TODO: You may also like
     */

    return res.status(200).json({
      message: 'success',
      payload: product
    });
  } catch (e) {
    return next(e);
  }
};

export const addFavouriteProduct = async (req, res, next) => {
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
