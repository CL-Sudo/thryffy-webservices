import axios from 'axios';
import CONFIG from '@configs/trackingmore.config';

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
