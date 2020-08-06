import nodemailer from 'nodemailer';
import * as Config from '@configs';

// const demoTransporter = nodemailer.createTransport({
//   host: 'smtp.ethereal.email',
//   port: 587,
//   auth: {
//     user: 'ucaqnbwxqpcmwnjp@ethereal.email',
//     pass: 'c9YVQWsHd3vF28jttt'
//   }
// });

const noReplyTransporter = nodemailer.createTransport({
  host: Config.nodeMailer.noReply.host,
  port: Config.nodeMailer.noReply.port,
  secure: Config.nodeMailer.noReply.secure,
  tls: Config.nodeMailer.noReply.tls,
  auth: {
    user: Config.nodeMailer.noReply.user,
    pass: Config.nodeMailer.noReply.pw
  }
});

const required = param => {
  throw new Error(`Error in nodemailer.js: ${param} is required`);
};

const sendMail = async (transporter = required('transporter'), config) =>
  new Promise(async (resolve, reject) => {
    try {
      const senderAddress = transporter.options.auth.user;
      const mailOptions = { ...config, from: senderAddress };
      return resolve(mailOptions);
      // const response = await transporter.sendMail(mailOptions);
      // return resolve(response);
    } catch (e) {
      return reject(e);
    }
  });

export const noReplyMailer = {
  transporter: noReplyTransporter,
  sendMail: config => sendMail(noReplyMailer.transporter, config)
};
