import { Sizes, CategorySize } from '@models';
import { defaultExcludeFields } from '@constants/sequelize.constant';
import R from 'ramda';

export const getSizes = async (req, res, next) => {
  try {
    const { categoryId } = req.query;
    const { limit, offset } = req.query;

    if (R.isNil(categoryId) || R.length(categoryId) === 0) {
      const sizes = await Sizes.findAndCountAll({
        attributes: { exclude: defaultExcludeFields },
        limit: Number(limit) || null,
        offset: Number(offset) || null
      });

      return res.status(200).json({
        message: 'success',
        payload: sizes
      });
    }

    const categorySizeIds = R.map(R.prop('sizeId'))(
      await CategorySize.findAll({
        raw: true,
        attributes: ['sizeId'],
        where: { categoryId }
      })
    );

    const sizes = await Sizes.findAndCountAll({
      raw: true,
      attributes: { exclude: defaultExcludeFields },
      where: { id: categorySizeIds },
      limit: Number(limit) || null,
      offset: Number(offset) || null
    });

    return res.status(200).json({ message: 'success', payload: sizes });
  } catch (e) {
    return next(e);
  }
};
