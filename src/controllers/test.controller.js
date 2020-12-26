import { Categories, Notifications } from '@models';
import { subscribeTokenToTopic, unsubscribeTokensFromTopic } from '@services/notification.service';

export const test = async (req, res, next) => {
  try {
    const { q } = req.query;

    // await subscribeTokenToTopic(['abc123', 'bcd321'], 'MARKETING');
    await unsubscribeTokensFromTopic(['abc123', 'bcd321'], 'MARKETING');

    return res.status(200).json({
      message: 'not found'
    });
  } catch (e) {
    console.log('e', e);
    return next(e);
  }
};
