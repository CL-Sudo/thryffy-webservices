import { Comments } from '@models/comments.model';
import { Products, Users } from '@models';

import { requestValidator } from '@validators';

import { getCountryId, paginate } from '@utils';

export const create = async (req, res, next) => {
  try {
    requestValidator(req);

    const { id } = req.user;
    const { productId } = req.params;

    const comment = await Comments.create({ ...req.body, productId, userId: id });

    const payload = await Comments.findOne({
      where: { id: comment.id },
      include: [
        {
          model: Products,
          as: 'product'
        },
        {
          model: Users,
          as: 'user'
        }
      ]
    });

    return res.status(200).json({ message: 'success', payload });
  } catch (e) {
    return next(e);
  }
};

export const list = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { limit, offset } = req.query;

    const countryId = await getCountryId(req);

    const product = await Products.scope([{ method: ['byCountry', countryId] }]).findOne({
      where: { id: productId }
    });
    if (!product) throw new Error('Invalid productId given');

    const comments = await Comments.findAll({
      where: { productId },
      include: [{ model: Users, as: 'user' }]
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
