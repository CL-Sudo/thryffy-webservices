import axios from 'axios';
import { oneWaySMS } from '@configs';

/**
 *
 * @param {String} receiverPhoneNo
 * @param {String} message
 */

export const sendSMS = async (receiverPhoneNo, message) =>
  new Promise(async (resolve, reject) => {
    try {
      const apiusername = oneWaySMS.username;
      const apipassword = oneWaySMS.password;
      const senderid = oneWaySMS.senderId;
      const mobileno = receiverPhoneNo;
      const languagetype = '1';
      const { url } = oneWaySMS;

      const res = await axios({
        method: 'GET',
        url,
        params: {
          apiusername,
          apipassword,
          senderid,
          mobileno,
          message,
          languagetype
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      switch (res.data) {
        case -100:
          throw new Error('apiusername or apipassword is invalid');
        case -200:
          throw new Error('senderid parameter is invalid');
        case -300:
          throw new Error('mobileno parameter is invalid');
        case -400:
          throw new Error('languagetype is invalid');
        case -500:
          throw new Error('Invalid characters in message');
        case -600:
          throw new Error('Insufficient credit balance');
        default:
          break;
      }

      return resolve(res);
    } catch (e) {
      return reject(e);
    }
  });
