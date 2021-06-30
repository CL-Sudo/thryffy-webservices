import { Sizes, CategorySize } from '@models';
import { requestValidator } from '@validators';

export const create = async (req, res, next) => {
  try {
    requestValidator(req);
    const size = await Sizes.findOne({ raw: true, where: { type: req.body.type } });
    const categorySizes = await CategorySize.findAll({ raw: true, where: { sizeId: size.id } });
    const payload = await Sizes.create(req.body);
    const createArr = categorySizes.map(obj => ({
      categoryId: obj.categoryId,
      sizeId: payload.id
    }));
    await CategorySize.bulkCreate(createArr);
    return res.status(200).json({ message: 'success', payload });
  } catch (e) {
    return next(e);
  }
};
