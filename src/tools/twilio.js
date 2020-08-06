import twilio from 'twilio';
import _ from 'lodash';
import { Twilio as Config, isDev, TestPhoneNo } from '@configs';

const client = twilio(Config.accountSid, Config.authToken);

export const validatePhoneNumber = async (number, { countryCode } = {}) => {
  try {
    let res;
    if (countryCode) {
      res = await client.lookups.phoneNumbers(number).fetch({ countryCode });
    } else {
      res = await client.lookups.phoneNumbers(number).fetch();
    }
    // countryCode: 'MY',
    // phoneNumber: '+60183525676',
    // nationalFormat: '018-352 5676',
    return Promise.resolve(res);
  } catch (e) {
    return Promise.reject(e);
  }
};

export const sendSMS = async ({ body, to }) => {
  try {
    if (_.isEmpty(body)) throw new Error('Twilio Send SMS: body cannot be empty');
    if (isDev && TestPhoneNo) to = TestPhoneNo;

    const message = await client.messages.create({ body, from: Config.from, to });
    return Promise.resolve(message);
  } catch (e) {
    return Promise.reject(e);
  }
};

export const sendWhatsAppMessage = async ({ body, to }) => {
  try {
    if (_.isEmpty(body)) throw new Error('Twilio Send SMS: body cannot be empty');
    if (isDev && TestPhoneNo) to = TestPhoneNo;

    const message = await client.messages.create({ from: `whatsapp:${Config.WhatsAppNo}`, body, to: `whatsapp:${to}` });
    return Promise.resolve(message);
  } catch (e) {
    return Promise.reject(e);
  }
};

export const voiceCall = async ({ message, to }) => {
  try {
    if (isDev && TestPhoneNo) to = TestPhoneNo;
    const call = await client.calls.create({
      twiml: `<Response><Say>${message}</Say></Response>`,
      to,
      from: Config.from
    });
    return Promise.resolve(call);
  } catch (e) {
    return Promise.reject(e);
  }
};
