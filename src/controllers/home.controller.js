import R from 'ramda';
import { Preferences, Products, Banners, FeatureItems } from '@models';
import { paginate } from '@utils';

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

    const preferences = await Preferences.findAll({ raw: true, where: { userId: id } });

    const groupId = (acc, { preferableId }) => acc.concat(preferableId);
    const groupByType = R.reduceBy(groupId, [], R.prop('preferableType'));

    const getPreferableObjList = R.pipe(
      R.map(data => ({
        preferableId: data.preferableId,
        preferableType: data.preferableType
      })),
      groupByType,
      R.merge({ condition: [], category: [], brand: [] })
    );

    const preferenceIds = getPreferableObjList(preferences);

    const assignCategory = R.isEmpty(preferenceIds.category)
      ? R.identity
      : R.assoc('categoryId', preferenceIds.category);

    const assignCondition = R.isEmpty(preferenceIds.condition)
      ? R.identity
      : R.assoc('conditionId', preferenceIds.condition);

    const assignBrand = R.isEmpty(preferenceIds.brand)
      ? R.identity
      : R.assoc('brandId', preferenceIds.brand);

    const where = R.pipe(assignBrand, assignCategory, assignCondition)({});

    console.log('where', where);

    const products = await Products.scope('default').findAll({
      where
    });

    return res.status(200).json({
      message: 'success',
      payload: {
        count: products.length,
        rows: paginate(limit)(offset)(products)
      }
    });
  } catch (e) {
    return next(e);
  }
};
