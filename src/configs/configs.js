import _ from 'lodash';

const dotenv = require('dotenv');

dotenv.config();

export const nodeEnv = _.toUpper(process.env.NODE_ENV) || 'PRODUCTION';
export const PORT = process.env[`${[nodeEnv]}_PORT`] || 3000;
export const SERVER_URL = `${process.env.SERVER_URL}`;
export const WEBSITE_URL = `${process.env.WEBSITE_URL}`;
export const isProduction = nodeEnv === 'PRODUCTION';
export const isDev = _.toLower(nodeEnv) === 'dev';
export const TestPhoneNo = process.env.TEST_PHONE_NO;

export const bcrypt = { saltRounds: 10 };
export const jwt = {
  dashboard: { name: `${process.env.APP_NAME}.${PORT}.at` },
  secret: 'shutupandberich8888',
  expiresIn: '1h'
};

export const passport = {
  strategy: {
    dashboard: 'dashboard-auth',
    portal: 'portal-auth',
    mobile: 'mobile-auth'
  }
};

export const nodeMailer = {
  noReply: {
    user: process.env.SMTP_USER,
    pw: process.env.SMTP_PASSWORD,
    host: process.env.SMTP_HOST,
    port: _.toNumber(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === true,
    tls: process.env.SMTP_REJECT_AUTH === 'false' || process.env.SMTP_REJECT_AUTH === false ? { rejectUnauthorized: false } : undefined
  }
};
