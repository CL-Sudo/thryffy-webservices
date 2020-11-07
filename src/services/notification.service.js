import axios from 'axios';

export const sendCloudMessage = ({ token, title, message, data }) =>
  new Promise(async (resolve, reject) => {
    try {
      const res = await axios({
        url: process.env.FCM_URL,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${process.env.FCM_SERVER_KEY}`
        },
        method: 'POST',
        data: {
          to: token || 'null',
          notification: {
            title,
            body: message,
            content_available: true,
            sound: 'default'
          },
          priority: 'high',
          data
        }
      });

      return resolve(res);
    } catch (e) {
      return reject(e);
    }
  });
