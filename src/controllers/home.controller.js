import R from 'ramda';
import { shuffle } from 'lodash';
import { Preferences, Products, Banners, FeatureItems, Sizes, Categories } from '@models';
import { getCountryId, paginate } from '@utils';
import { Op } from 'sequelize';
import * as _ from 'lodash';

export const getBannersList = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;

    const countryId = await getCountryId(req);

    const payload = await Banners.scope([{ method: ['byCountry', countryId] }]).findAndCountAll({
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

    const countryId = await getCountryId(req);

    const productIds = await Products.scope([
      'availableForSale',
      { method: ['byCountry', countryId] }
    ])
      .findAll()
      .then(instances => _.map(instances, 'id'));

    const payload = await FeatureItems.findAll({
      where: { productId: productIds },
      include: [
        {
          model: Products,
          as: 'product',
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

    const countryId = await getCountryId(req);

    const preferences = await Preferences.findAll({ raw: true, where: { userId: id } });

    const groupId = (acc, { preferableId }) => acc.concat(preferableId);
    const groupByType = R.reduceBy(groupId, [], R.prop('preferableType'));

    const getPreferableObjList = R.pipe(
      R.map(data => ({
        preferableId: data.preferableId,
        preferableType: data.preferableType
      })),
      groupByType,
      R.merge({ condition: [], category: [], brand: [], size: [] })
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

    const assignSize = R.isEmpty(preferenceIds.size)
      ? R.identity
      : R.assoc('sizeId', preferenceIds.size);

    const where = R.pipe(
      assignBrand,
      assignCategory,
      assignCondition,
      assignSize
    )({
      isPublished: true,
      isPurchased: false,
      userId: {
        [Op.ne]: id
      }
    });

    const data = await Products.scope([
      'productList',
      'availableForSale',
      { method: ['byCountry', countryId] }
    ]).findAndCountAll({
      where,
      limit: Number(limit) || null,
      offset: Number(offset) || null
    });

    // paginate(limit)(offset)

    const rows = await Promise.all(
      shuffle(data.rows).map(async row => {
        await row.getExtraFields(id);
        return row;
      })
    );

    return res.status(200).json({
      message: 'success',
      payload: {
        count: data.count,
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

    const countryId = await getCountryId(req);
    const data = await Products.scope([
      'productList',
      'availableForSale',
      { method: ['byCountry', countryId] }
    ]).findAndCountAll({
      limit: Number(limit) || null,
      offset: Number(offset) || null,
      order: [['createdAt', 'DESC']]
    });
    return res.status(200).json({
      message: 'success',
      payload: {
        count: data.count,
        rows: shuffle(data.rows)
      }
    });
  } catch (e) {
    return next(e);
  }
};
