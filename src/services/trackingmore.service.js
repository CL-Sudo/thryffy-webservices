import axios from 'axios';
import CONFIG from '@configs/trackingmore.config';
import _ from 'lodash';
import crypto from 'crypto';

export const postTrackingNumber = trackingNumber =>
  new Promise(async (resolve, reject) => {
    try {
      const res = await axios({
        method: 'post',
        url: `${CONFIG.URL}/v2/trackings/post`,
        data: {
          carrier_code: 'malaysia-post',
          tracking_number: trackingNumber
        },
        headers: {
          'Content-Type': 'application/json',
          'Trackingmore-Api-Key': CONFIG.API_KEY
        }
      });
      return resolve(res);
    } catch (e) {
      return reject(e);
    }
  });

export const getTrackingResult = async trackingNumber => {
  try {
    const res = await axios({
      method: 'get',
      url: `${CONFIG.URL}/v2/trackings/malaysia-post/${trackingNumber}`,
      headers: {
        'Content-Type': 'application/json',
        'Trackingmore-Api-Key': CONFIG.API_KEY
      }
    });
    const trackingData = _.get(res, 'data.data.origin_info.trackinfo', []);
    return Promise.resolve(_.reverse(trackingData));
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getUserInfo = async () => {
  try {
    const res = await axios({
      method: 'get',
      url: `${CONFIG.URL}/v2/trackings/getuserinfo`,
      headers: {
        'Content-Type': 'application/json',
        'Trackingmore-Api-Key': CONFIG.API_KEY
      }
    });
    return Promise.resolve(res.data.data);
  } catch (e) {
    return Promise.reject(e);
  }
};

export const vertifySignature = async (timeStr, signature) => {
  try {
    const userInfo = await getUserInfo();
    const hmac = crypto.createHmac('sha256', userInfo.email);
    hmac.update(`${timeStr}`);
    const hash = hmac.digest('hex');

    return Promise.resolve(hash === signature);
  } catch (e) {
    return Promise.reject(e);
  }
};
