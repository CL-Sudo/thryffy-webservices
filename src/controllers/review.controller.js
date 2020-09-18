import { requestValidator } from '@validators';
import { OrderItems, Products, Reviews } from '@models';

export const create = async (req, res, next) => {
  try {
    requestValidator(req);
    const { orderId, rating, comment, createdBy } = req.body;

    const orderItem = await OrderItems.findOne({
      include: [
        {
          model: Products,
          as: 'product'
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

    return res.status(200).json({
      message: 'success',
      payload: review
    });
  } catch (e) {
    return next(e);
  }
};
