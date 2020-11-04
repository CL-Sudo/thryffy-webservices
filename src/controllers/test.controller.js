import { generateOrderNumber } from '@utils/sales_orders.util';
import { sendMail } from '@tools/sendgrid';
import SENDGRID from '@constants/sendgrid.constant';

export const test = async (req, res, next) => {
  try {
    const { q } = req.query;

    await sendMail('elgoogym0001@gmail.com', 'Ching Lung', 'Lau', {}, SENDGRID.TEST);

    return res.status(404).json({
      message: 'not found',
      payload: generateOrderNumber(q)
    });
  } catch (e) {
    return next(e);
  }
};
