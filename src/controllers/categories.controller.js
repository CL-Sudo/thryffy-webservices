import { Categories, Sizes } from '@models';
import { Op } from 'sequelize';
import { requestValidator } from '@validators';
import R from 'ramda';

export const list = async (req, res, next) => {
  try {
    const { parent, childId, limit, offset } = req.query;
    requestValidator(req);

    const getChildren = async () => {
      try {
        const parentObject = await Categories.findOne({
          where: {
            title: {
              [Op.like]: `%${parent}%`
            }
          }
        });

        const children = await Categories.findAndCountAll({
          where: { parentId: parentObject.id },
          limit,
          offset
        });
        return Promise.resolve(children);
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const getCategories = async children => {
      try {
        if (R.isNil(childId)) return Promise.resolve(children);
        const childArr = await Categories.findAndCountAll({
          where: { parentId: childId },
          include: [{ model: Sizes, as: 'sizes' }],
          limit,
          offset
        });
        return Promise.resolve(childArr);
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const result = await R.pipeP(getChildren, getCategories)();

    return res.status(200).json({
      message: 'success',
      payload: result
    });
  } catch (e) {
    return next(e);
  }
};

export const getDefaultSize = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const category = await Categories.findOne({ where: { id: categoryId } });
    if (!category) throw new Error('Invalid categoryId given');

    return res.status(200).json({ message: 'success', payload: category.default });
  } catch (e) {
    return next(e);
  }
};
