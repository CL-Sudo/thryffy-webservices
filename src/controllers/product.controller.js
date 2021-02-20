import { Products, FavouriteProducts } from '@models';
import R from 'ramda';
import _ from 'lodash';
import { paginate } from '@utils';

export const getOne = async (req, res, next) => {
  try {
    const id = R.pathOr('N/A', ['user', 'id'])(req);
    const { productId } = req.params;
    const product = await Products.scope({ method: ['productPage', productId] }).findOne();

    if (product.userId !== id) {
      await product.increment('viewCount');
      await product.reload();
    }

    await product.getExtraFields(id);

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

export const youMayAlsoLike = async (req, res, next) => {
  try {
    const id = R.pathOr('N/A', ['user', 'id'])(req);
    const { productId } = req.params;
    const { limit, offset } = req.query;

    const product = await Products.findOne({ where: { id: productId } });

    if (!product) throw new Error('Invalid productId given.');

    const recommedations = await Products.scope('default').findAll({
      where: {
        categoryId: product.categoryId
      }
    });

    const payload = _.shuffle(R.reject(p => p.id === Number(productId))(recommedations));

    await Promise.all(
      payload.map(async data => {
        await data.getExtraFields(id);
      })
    );

    return res.status(200).json({
      message: 'success',
      payload: {
        count: payload.length,
        rows: paginate(limit)(offset)(payload)
      }
    });
  } catch (e) {
    return next(e);
  }
};
