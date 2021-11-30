import axios from 'axios';
import queryString from 'querystring';

const { NODE_ENV, NGROK_URL, SERVER_URL, BEEP_PAY_API_KEY, BEEP_PAY_MERCHANT_ID } = process.env;

const returnUrl = `${NODE_ENV === 'DEV' ? NGROK_URL : SERVER_URL}/api/publics/beep-pay-callback`;

export const generateOrder = ({ orderId, orderAmount }) => {
  const params = {
    user: 'my merchant id',
    apiToken: 'my api token',
    returnUrl: 'my return url',
    action: '',
    order_id: 2,
    order_amount: 10
  };

  return axios({
    url: `https://pay.beep.solutions/generateorder`,
    method: 'POST',
    data: params
  });
};
