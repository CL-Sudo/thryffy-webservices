import { Categories } from '@models';

import axios from 'axios';

export const test = async (req, res, next) => {
  try {
    const { q } = req.query;

    // const response = await axios({
    //   url: 'https://iid.googleapis.com/iid/info/AIzaSyBoddn4x1B0ZC4WTxd0A1Wqd-PUt3XBOG0',
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `key=${process.env.FCM_SERVER_KEY}`,
    //     details: true
    //   }
    // });
    // console.log('response.data', response.data);
    return res.status(200).json({
      message: 'not found'
    });
  } catch (e) {
    console.log('e', e);
    return next(e);
  }
};
