import { EventEmitter } from 'events';
import { sendSMS } from '@services/sms.service';
import { SMSVerifcation } from '@templates/sms.template';

export const authListener = new EventEmitter();

const sendOTPViaSMS = async user => {
  try {
    const phoneNumber = `${user.phoneCountryCode}${user.phoneNumber}`;
    await sendSMS(phoneNumber, SMSVerifcation(user.otp));
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

authListener.on('userSignUp', async user => {
  try {
    const phoneNumber = `${user.phoneCountryCode}${user.phoneNumber}`;
    await sendSMS(phoneNumber, SMSVerifcation(user.otp));
    return Promise.resolve();
  } catch (e) {
    console.log('e', e);
    throw e;
  }
});
