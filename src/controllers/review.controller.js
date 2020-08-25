import R from 'ramda';
import { requestValidator } from '@validators';
import { OrderItems, Products, Reviews } from '@models';

export const create = async (req, res, next) => {
  try {
    requestValidator(req);
    const { orderItemId, rating, comment, createdBy } = req.body;

    const orderItem = await OrderItems.findOne({
      include: [
        {
          model: Products,
          as: 'product'
        }
      ],
      where: { id: orderItemId }
    });

    const sellerId = orderItem.product.userId;

    await Reviews.create({
      sellerId,
      orderItemId,
      rating,
      comment,
      createdBy
    });

    return res.status(200).json({
      message: 'success'
    });
  } catch (e) {
    return next(e);
  }
};
