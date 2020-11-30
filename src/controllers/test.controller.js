import {
  sendCloudMessage,
  subscribeTokenToTopic,
  unsubscribeTokensFromTopic
} from '@services/notification.service';

export const test = async (req, res, next) => {
  try {
    await subscribeTokenToTopic('sdfads', 'MARKETING');
    await unsubscribeTokensFromTopic(['kjljl'], 'MARKETING');
    // await sendCloudMessage({ topic: 'MARKETING', title: 'title', message: 'message' });

    return res.status(404).json({
      message: 'not found',
      payload: {}
    });
  } catch (e) {
    console.log('e', e);
    return next(e);
  }
};
