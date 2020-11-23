import R from 'ramda';
import { Preferences, Products, Banners, FeatureItems } from '@models';

export const getBannersList = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;

    const payload = await Banners.findAndCountAll({
      limit: Number(limit) || null,
      offset: Number(offset) || null
    });

    return res.status(200).json({ message: 'success', payload });
  } catch (e) {
    return next(e);
  }
};

export const getFeatureItemsList = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;

    const payload = await FeatureItems.findAndCountAll({
      limit: Number(limit) || null,
      offset: Number(offset) || null,
      include: [{ model: Products, as: 'product' }]
    });

    return res.status(200).json({ message: 'success', payload });
  } catch (e) {
    return next(e);
  }
};

export const getCuratedList = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { limit, offset } = req.params;

    const preferenceIds = R.map(R.prop('categoryId'))(
      await Preferences.findAll({ where: { userId: id } })
    );

    const products = await Products.scope('default').findAndCountAll({
      where: { categoryId: preferenceIds },
      limit: Number(limit) || null,
      offset: Number(offset) || null
    });

    return res.status(200).json({ message: 'success', payload: products });
  } catch (e) {
    return next(e);
  }
};
