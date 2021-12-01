import axios from 'axios';
import FormData from 'form-data';

const { NODE_ENV, NGROK_URL, SERVER_URL, BEEP_PAY_API_KEY, BEEP_PAY_MERCHANT_ID } = process.env;

const returnUrl = `${NODE_ENV === 'DEV' ? NGROK_URL : SERVER_URL}/api/publics/beep-pay-callback`;

export const generateOrder = ({ orderId, orderAmount }) => {
  const form = new FormData();
  form.append('user', BEEP_PAY_MERCHANT_ID);
  form.append('apiToken', BEEP_PAY_API_KEY);
  form.append('returnUrl', returnUrl);
  form.append('order_id', orderId);
  form.append('order_amount', orderAmount);

  const formHeaders = form.getHeaders();

  return axios({
    url: 'https://pay.beep.solutions/generateorder',
    headers: { ...formHeaders },
    method: 'POST',
    data: form,
    withCredentials: false
  });
};
