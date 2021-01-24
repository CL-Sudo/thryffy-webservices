import { EventEmitter } from 'events';
import { sendSMS } from '@services/sms.service';
import { SMSVerifcation } from '@templates/sms.template';
import LISTENER_EVENT from '@constants/listener.constant';

export const authListener = new EventEmitter();

const sendOTPViaSMS = async user => {
  try {
    const phoneNumber = `${user.phoneCountryCode}${user.phoneNumber}`;
    console.log('phoneNumber', phoneNumber);
    await sendSMS(phoneNumber, SMSVerifcation(user.otp));
  } catch (e) {
    console.error(e);
  }
};

authListener.on(LISTENER_EVENT.AUTHENTICATION.SIGNUP, sendOTPViaSMS);
