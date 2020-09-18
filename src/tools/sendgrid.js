import Axios from 'axios';
// import { MailLogs } from '@models';
// import { MAIL_LOG_STATUS } from '@constants';

export const sendMail = (
  receiverEmail,
  receiverFirstName,
  receiverLastName,
  templateData,
  template,
  attachments = null
) =>
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
                  name: `${receiverFirstName} ${receiverLastName}`
                }
              ],
              dynamic_template_data: templateData
            }
          ],
          from: {
            email: process.env.NO_REPLY_EMAIL,
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

// export const sendEmail = option =>
//   new Promise(async (resolve, reject) => {
//     const { to, from, data, templateId, attachments, subject } = option;
//     const sendTo = [];
//     const getEmailData = val => {
//       if (_.isString(val)) return { email: val };
//       if (_.isObject(val)) {
//         const email = _.get(val, 'email', _.get(val, 'to'));
//         const name = _.get(val, 'name', _.get(val, 'fullName'));
//         const obj = {};
//         if (email) obj.email = email;
//         if (name) obj.name = name;
//         return obj;
//       }
//       return val;
//     };

//     if (_.isArray(to)) {
//       _.map(to, t => {
//         sendTo.push(getEmailData(t));
//       });
//     } else {
//       sendTo.push(getEmailData(to));
//     }

//     if (isDev) {
//       _.map(sendTo, (t, i) => {
//         if (_.isObject(t)) {
//           // eslint-disable-next-line no-param-reassign
//           t.email = process.env.TEST_MAIL;
//         } else if (_.isString(t)) {
//           sendTo[i] = process.env.TEST_MAIL;
//         }
//       });
//     }

//     try {
//       const res = await Axios({
//         method: 'POST',
//         url: 'https://api.sendgrid.com/v3/mail/send',
//         headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}` },
//         data: {
//           personalizations: [{ to: sendTo, dynamic_template_data: data, subject }],
//           from: {
//             email: _.get(from, 'email', process.env.NO_REPLY_EMAIL),
//             name: _.get(from, 'name', process.env.EMAIL_SENDER_NAME)
//           },
//           template_id: templateId,
//           attachments
//         }
//       });

//       MailLogs.create({
//         templateId: _.get(option, 'templateId'),
//         email: _.get(to, 'email'),
//         requestData: JSON.stringify(option),
//         status: MAIL_LOG_STATUS.SUCCESS
//       });
//       return resolve(res);
//     } catch (e) {
//       MailLogs.create({
//         templateId: _.get(option, 'templateId'),
//         email: _.get(option, 'to.email'),
//         requestData: JSON.stringify(option),
//         error: JSON.stringify(_.get(e, 'response.data.error', _.get(e, 'response.data'), '')),
//         response: JSON.stringify(_.get(e, 'response.data', e)),
//         status: MAIL_LOG_STATUS.FAILED
//       });
//       return reject(e);
//     }
//   });
