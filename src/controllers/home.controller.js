import R from 'ramda';
import { Preferences, Products } from '@models';

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

    const products = await Products.scope('default').findAndCountAll({
      where: {
        categoryId: preferenceIds.category,
        brandId: preferenceIds.brand,
        conditionId: preferenceIds.condition
      },
      limit: Number(limit) || null,
      offset: Number(offset) || null
    });

    return res.status(200).json({ message: 'success', payload: products });
  } catch (e) {
    return next(e);
  }
};
