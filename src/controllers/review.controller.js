import { requestValidator } from '@validators';
import { Brands, OrderItems, Products, Reviews } from '@models';
import { reviewListener } from '@listeners/review.listener';

export const create = async (req, res, next) => {
  try {
    requestValidator(req);
    const { orderId, rating, comment, createdBy } = req.body;

    const orderItem = await OrderItems.findOne({
      include: [
        {
          model: Products,
          as: 'product',
          include: [
            {
              model: Brands,
              as: 'brand',
              attributes: ['id', 'title']
            }
          ]
        }
      ],
      where: { salesOrderId: orderId }
    });

    const sellerId = orderItem.product.userId;

    const review = await Reviews.create({
      sellerId,
      orderId,
      rating,
      comment,
      createdBy
    });

    reviewListener.emit('REVIEW RECEIVED', review);

    return res.status(200).json({
      message: 'success',
      payload: review
    });
  } catch (e) {
    return next(e);
  }
};
