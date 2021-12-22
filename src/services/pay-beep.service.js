import axios from 'axios';
import FormData from 'form-data';

const { NODE_ENV, NGROK_URL, SERVER_URL, BEEP_PAY_API_KEY, BEEP_PAY_MERCHANT_ID } = process.env;

const returnUrl = `${NODE_ENV === 'DEV' ? NGROK_URL : SERVER_URL}/api/publics/beep-pay-redirect`;

/**
 *
 * @param {*} orderAmount
 * @param {*} data Example: 'u23-p2-o13' u=userId,  p=packageId, o=orderId
 * @returns
 */
export const getBeepPayPaymentUrl = async (orderAmount, data) => {
  const form = new FormData();
  form.append('user', BEEP_PAY_MERCHANT_ID);
  form.append('apiToken', BEEP_PAY_API_KEY);
  form.append('returnUrl', returnUrl);
  form.append('order_id', data);
  form.append('order_amount', orderAmount);

  const formHeaders = form.getHeaders();

  const response = await axios({
    url: 'https://pay.beep.solutions/generateorder',
    headers: { ...formHeaders },
    method: 'POST',
    data: form,
    withCredentials: false
  });

  const { Token } = response.data.result;

  return `https://pay.beep.solutions/order?Token=${Token}`;
};
