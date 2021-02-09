import { Comments, Products, Users } from '@models';
import { paginate } from '@utils';

export const list = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit, offset } = req.query;

    const product = await Products.findOne({ where: { id } });
    if (!product) throw new Error('Invalid productId given');

    const comments = await Comments.findAll({
      where: { productId: id },
      include: [
        { model: Products, as: 'product' },
        { model: Users, as: 'user' }
      ]
    });

    return res.status(200).json({
      message: 'success',
      payload: {
        count: comments.length,
        rows: paginate(limit)(offset)(comments)
      }
    });
  } catch (e) {
    return next(e);
  }
};
