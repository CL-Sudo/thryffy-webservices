import { Categories } from '@models';

export const test = async (req, res, next) => {
  try {
    const { q } = req.query;

    const sizes = await Categories.findAll({
      where: { id: q },
      include: [
        {
          model: Categories,
          as: 'subCategories'
        }
      ]
    });

    return res.status(200).json({
      message: 'success',
      payload: sizes
    });
  } catch (e) {
    return next(e);
  }
};
