import { SalesOrders } from '@models';

import Billplz from '@services/billplz.service';

import { PAYMENT_STATUS, DELIVERY_STATUS } from '@constants';

export const billplzCallback = async (req, res, next) => {
  try {
    const { orderId } = req.query;
    const { x_signature: xSignature, paid } = req.body;
    const billplz = new Billplz();

    if (billplz.verifyXSignature(xSignature, req.body)) {
      const order = await SalesOrders.findOne({ where: { id: orderId } });
      await order.update({
        paymentStatus: paid === 'true' ? PAYMENT_STATUS.SUCCESS : PAYMENT_STATUS.PENDING,
        deliveryStatus: paid === 'true' ? DELIVERY_STATUS.TO_SHIP : null
      });
    }

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    return next(e);
  }
};
