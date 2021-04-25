import R from 'ramda';
import { shuffle } from 'lodash';
import { Preferences, Products, Banners, FeatureItems, Sizes, Categories } from '@models';
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
    const id = R.pathOr('N/A', ['user', 'id'])(req);

    const payload = await FeatureItems.findAll({
      include: [
        {
          model: Products,
          as: 'product',
          where: { isPurchased: false, isPublished: true },
          include: [
            { model: Sizes, as: 'size' },
            { model: Categories, as: 'category' }
          ]
        }
      ]
    });

    const rows = await Promise.all(
      paginate(limit)(offset)(payload).map(async row => {
        await row.product.getExtraFields(id);
        return row;
      })
    );

    return res.status(200).json({
      message: 'success',
      payload: {
        count: payload.length,
        rows
      }
    });
  } catch (e) {
    return next(e);
  }
};

export const getCuratedList = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { limit, offset } = req.query;

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

    const where = R.pipe(
      assignBrand,
      assignCategory,
      assignCondition
    )({
      isPublished: true,
      isPurchased: false
    });

    const products = await Products.scope('default').findAll({
      where
    });

    const rows = await Promise.all(
      paginate(limit)(offset)(products).map(async row => {
        await row.getExtraFields(id);
        return row;
      })
    );

    return res.status(200).json({
      message: 'success',
      payload: {
        count: products.length,
        rows
      }
    });
  } catch (e) {
    return next(e);
  }
};

export const publicCuratedList = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const products = await Products.findAll({
      limit: 1000,
      order: [['createdAt', 'DESC']]
    });
    return res.status(200).json({
      message: 'success',
      payload: {
        count: products.length,
        rows: paginate(limit)(offset)(shuffle(products))
      }
    });
  } catch (e) {
    return next(e);
  }
};
