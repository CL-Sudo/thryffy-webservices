import { getTrackingResult } from '@services/trackingmore.service';
import { DeliveryStatuses, SalesOrders } from '@models';
import R from 'ramda';
import * as _ from 'lodash';

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

    if (!order) throw new Error('Invalid order id given');

    // if (id !== order.sellerId && id !== order.userId) {
    //   throw new Error('Request declined');
    // }

    const trackingmorePayload = _.get(order, 'trackingmore.trackingmorePayload');

    let trackinfo;

    if (R.isEmpty(trackingmorePayload) || R.isNil(trackingmorePayload)) {
      trackinfo = [];
    } else {
      trackinfo = R.pathOr([], ['origin_info', 'trackinfo'])(JSON.parse(trackingmorePayload));
      trackinfo = R.reverse(trackinfo);
    }

    return res.status(200).json({ message: 'success', payload: trackinfo });
  } catch (e) {
    return next(e);
  }
};
