import { generateOrderNumber } from '@utils/sales_orders.util';

export const test = async (req, res, next) => {
  try {
    const { q } = req.query;

    return res.status(404).json({
      message: 'not found',
      payload: generateOrderNumber(q)
    });
  } catch (e) {
    return next(e);
  }
};
