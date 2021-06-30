import Axios from 'axios';
import CONFIG from '@configs/sendgrid.config';

export const sendMail = ({
  receiverEmail,
  receiverFirstName,
  receiverLastName,
  templateData = {},
  template,
  attachments = null,
  type = null
}) =>
  new Promise(async (resolve, reject) => {
    try {
      const res = await Axios({
        url: 'https://api.sendgrid.com/v3/mail/send',
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`
        },
        method: 'POST',
        data: {
          personalizations: [
            {
              to: [
                {
                  email: receiverEmail,
                  name: `${receiverFirstName || ''} ${receiverLastName || ''}`
                }
              ],
              dynamic_template_data: templateData
            }
          ],
          from: {
            email: type ? CONFIG[`SENDGRID_${type}_SENDER`] : process.env.NO_REPLY_EMAIL,
            name: process.env.EMAIL_SENDER_NAME
          },
          template_id: template,
          attachments
        }
      });
      return resolve(res);
    } catch (e) {
      return reject(e);
    }
  });
