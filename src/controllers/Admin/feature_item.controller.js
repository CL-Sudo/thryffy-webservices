import { FeatureItems, Products } from '@models';

export const create = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const product = await Products.findOne({ where: { id: productId } });
    if (!product) throw new Error('Invalid productId given');

    const featureItem = await FeatureItems.findOne({ where: { productId } });
    if (featureItem) throw new Error('Product already exists');

    const payload = await FeatureItems.create({ ...req.body });

    const productCreated = await Products.findOne({ where: { id: productId } });

    return res
      .status(200)
      .json({ message: 'success', payload: { ...payload.dataValues, productCreated } });
  } catch (e) {
    return next(e);
  }
};
