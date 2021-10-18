import { FeatureItems, Products } from '@models';
import { getLimitOffset } from '@utils/express.util';

export const create = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const product = await Products.scope([{ method: ['byCountry', req.user.countryId] }]).findOne({
      where: { id: productId }
    });
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

export const list = async (req, res, next) => {
  try {
    const { countryId } = req.user;
    const { limit, offset } = getLimitOffset(req);

    const result = await FeatureItems.findAndCountAll({
      include: [
        {
          model: Products,
          as: 'product',
          where: { countryId }
        }
      ],
      limit,
      offset
    });

    return res.status(200).json({
      message: 'success',
      payload: {
        count: result.count,
        rows: result.rows
      }
    });
  } catch (e) {
    return next(e);
  }
};
