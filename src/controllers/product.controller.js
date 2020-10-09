import { Products, FavouriteProducts } from '@models';
import { logView } from '@services/view_history.service';
import R from 'ramda';

export const getOne = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { productId } = req.params;
    const product = await Products.scope({ method: ['productPage', productId] }).findOne();

    if (product.userId !== id) {
      await product.increment('viewCount');
      await product.reload();
    }

    await product.getExtraFields(id);

    await logView(productId, id);

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
