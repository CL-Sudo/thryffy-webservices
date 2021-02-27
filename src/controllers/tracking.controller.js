import { getTrackingResult } from '@services/trackingmore.service';
import { DeliveryStatuses, SalesOrders } from '@models';
import R from 'ramda';

export const getTrackingDataRequest = async (req, res, next) => {
  try {
    const { trackingNumber } = req.query;
    if (!trackingNumber) return next(new Error('Tracking number is required!'));

    const trackingData = await getTrackingResult(trackingNumber);

    return res
      .status(200)
      .json({ message: 'Get tracking data successfully', payload: { trackingData } });
  } catch (e) {
    return next(e);
  }
};

export const getTrackingInfoByOrderId = async (req, res, next) => {
  try {
    const { id } = req.user;

    const { orderId } = req.params;
    const order = await SalesOrders.findOne({
      where: { id: orderId },
      include: [{ model: DeliveryStatuses, as: 'trackingmore' }]
    });

    if (id !== order.sellerId && id !== order.userId) {
      throw new Error('Request declined');
    }

    let trackinfo;

    if (R.isEmpty(R.pathOr('', ['trackingmore', 'trackingmorePayload'], order))) {
      trackinfo = [];
    } else {
      trackinfo = R.path(['origin_info', 'trackinfo'])(
        JSON.parse(order.trackingmore.trackingmorePayload)
      );
    }

    return res.status(200).json({ message: 'success', payload: R.reverse(trackinfo) });
  } catch (e) {
    return next(e);
  }
};
