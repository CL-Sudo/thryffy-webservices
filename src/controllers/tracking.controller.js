import { getTrackingResult } from '@services/trackingmore.service';

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
