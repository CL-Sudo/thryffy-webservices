import axios from 'axios';
import FormData from 'form-data';
import * as _ from 'lodash';
import queryString from 'querystring';

const { NODE_ENV, NGROK_URL, SERVER_URL, BEEP_PAY_API_KEY, BEEP_PAY_MERCHANT_ID } = process.env;

const returnUrl = `${NODE_ENV === 'DEV' ? NGROK_URL : SERVER_URL}/api/publics/beep-pay-redirect`;

export const getBeepPayPaymentHTML = async ({ orderAmount, data = {} }) => {
  const form = new FormData();
  form.append('user', BEEP_PAY_MERCHANT_ID);
  form.append('apiToken', BEEP_PAY_API_KEY);
  form.append('returnUrl', returnUrl);
  form.append('order_id', queryString.stringify(data));
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

  const { data: paymentPageHTML } = await axios({
    url: `https://pay.beep.solutions/order?Token=${Token}`,
    method: 'GET'
  });

  return paymentPageHTML;
};
