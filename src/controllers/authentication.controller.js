import R from 'ramda';
import _ from 'lodash';
import passport from 'passport';
import AppleAuth from 'apple-signin-auth';
import { Users, Admins, NotificationSettings, Otps } from '@models';
import * as Configs from '@configs';
import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';
import { generateRefreshToken, generateJWT, generateOTP } from '@utils/auth.util';
import { USER_TYPE } from '@constants/index';
import { authListener } from '@listeners';
import { requestValidator } from '@validators';
import { hashPassword } from '@tools/bcrypt';
import moment from 'moment';
import { sendSMS } from '@services/sms.service';
import { SMSVerifcation } from '@templates/sms.template';
import { sendMail } from '@tools/sendgrid';
import LISTENER_EVENT from '@constants/listener.constant';
import EMAIL_TEMPLATE from '@templates/email.template';
import AUTH_CONFIG from '@configs/auth.config';
import { getCountryId } from '@utils/index';

const assignUserType = user => type => R.assoc('type', type)(user);

const createFacebookUserAccount = provider =>
  new Promise(async (resolve, reject) => {
    const { id: facebookId, displayName } = provider;
    const email = _.get(provider, 'emails[0].value', null);
    const transaction = await sequelize.transaction();
    try {
      const user = await Users.create(
        {
          facebookId,
          email,
          fullName: displayName,
          isVerified: true
        },
        { transaction }
      );

      await sendMail({
        receiverEmail: user.email,
        template: EMAIL_TEMPLATE.WELCOME_EMAIL,
        templateData: {
          username: user.fullName || user.username
        }
      });

      await transaction.commit();
      return resolve();
    } catch (e) {
      await transaction.rollback();
      return reject(e);
    }
  });

const createGoogleUserAccount = async (provider, countryId) =>
  new Promise(async (resolve, reject) => {
    const transaction = await sequelize.transaction();
    try {
      const { id: googleId, displayName } = provider;
      const email = _.get(provider, 'emails[0].value');
      const user = await Users.create(
        {
          countryId,
          googleId,
          email,
          fullName: displayName,
          isVerified: true
        },
        { transaction }
      );
      await sendMail({
        receiverEmail: user.email,
        template: EMAIL_TEMPLATE.WELCOME_EMAIL,
        templateData: {
          username: user.fullName || user.username
        }
      });
      await transaction.commit();
      return resolve();
    } catch (e) {
      await transaction.rollback();
      return reject(e);
    }
  });

const createAppleUserAccount = async provider =>
  new Promise(async (resolve, reject) => {
    const transaction = await sequelize.transaction();
    try {
      const { email = null, userAppleId: appleId, fullName } = provider;

      const userByEmail = await Users.findOne({ where: { email }, transaction });

      const user = await R.ifElse(
        R.isNil,
        async () => {
          await Users.create(
            {
              appleId,
              email,
              fullName,
              isVerified: true
            },
            { transaction }
          );

          await transaction.commit();

          const data = await Users.findOne({
            where: { appleId },
            include: [{ model: NotificationSettings, as: 'notificationSetting' }]
          });

          if (data.email) {
            await sendMail({
              receiverEmail: data.email,
              template: EMAIL_TEMPLATE.WELCOME_EMAIL,
              templateData: {
                username: data.fullName || data.username
              }
            });
          }

          return Promise.resolve(data);
        },
        async instance => {
          await instance.update({ appleId, isVerified: true }, { transaction });
          await transaction.commit();

          const data = await Users.findOne({
            where: { appleId },
            include: [{ model: NotificationSettings, as: 'notificationSetting' }]
          });

          return Promise.resolve(data);
        }
      )(userByEmail);

      return resolve(user);
    } catch (e) {
      await transaction.rollback();
      return reject(e);
    }
  });

export const mobileSignIn = async (req, res, next) => {
  req
    .check('email')
    .trim()
    .normalizeEmail();
  req
    .check('password')
    .exists()
    .withMessage('Must contain password')
    .isLength({ min: 4 });
  try {
    await req.asyncValidationErrors();

    return passport.authenticate(
      'mobile-login',
      async (err, usr, info) => {
        try {
          if (err) return next(err);
          if (!usr) return next(new Error(info.message));

          if (!usr.isVerified) {
            const otp = generateOTP();
            await Users.update(
              { otp, otpValidity: moment().add(10, 'minutes') },
              { where: { id: usr.id } }
            );
            await sendSMS(usr.completePhoneNumber, SMSVerifcation(otp));
            return res.status(202).json({
              message: 'user not verified'
            });
          }

          const user = await Users.findOne({
            include: ['country', 'notificationSetting'],
            where: { id: usr.id }
          });

          const refreshToken = generateRefreshToken();
          await user.update({ refreshToken });

          await user.update({
            refreshToken,
            lastLogin: new Date(),
            loginFrequency: user.loginFrequency + 1
          });

          const jwt = await generateJWT({
            id: user.id,
            type: USER_TYPE.CUSTOMER,
            countryId: user.countryId
          });

          const token = `Bearer ${jwt}`;

          return res.status(200).json({
            message: 'success',
            payload: { ...user.get(), type: USER_TYPE.CUSTOMER },
            token,
            refreshToken
          });
        } catch (e) {
          return next(e);
        }
      },
      { session: false }
    )(req, res, next);
  } catch (e) {
    return next(e);
  }
};

export const mobileRevoke = async (req, res, next) => {
  try {
    return passport.authenticate(
      Configs.passport.strategy.mobile,
      { session: false },
      async (err, user, info) => {
        const { refreshToken } = req.body;

        if (refreshToken) {
          const loggedInUser = await Users.findOne({
            where: { refreshToken },
            attributes: ['id']
          });
          if (R.isNil(loggedInUser)) {
            return next(new Error('User Logged out'));
          }
          const payload = await Users.findOne({
            where: { id: loggedInUser.id },
            include: ['notificationSetting', 'country']
          });

          if (!payload.active) {
            return next(new Error('Inactive account'));
          }

          if (!payload.isVerified) {
            return next(new Error('Account is not verified'));
          }
          const token = await generateJWT({
            id: user.id,
            type: USER_TYPE.CUSTOMER,
            countryId: user.countryId
          });
          const rf = payload.get('refreshToken');

          return res.json({
            message: 'Logged in successfully',
            payload: { ...payload.get(), type: USER_TYPE.CUSTOMER },
            token: `Bearer ${token}`,
            refreshToken: rf
          });
        }

        if (user) {
          const payload = await Users.findOne({
            where: { id: user.id },
            include: ['notificationSetting', 'country']
          });
          if (!payload.active) {
            throw new Error('This account is not active');
          }
          if (!payload.isVerified) {
            return next(new Error('Account is not verified'));
          }
          const tokenPayload = { id: user.id, type: USER_TYPE.CUSTOMER, countryId: user.countryId };
          const withType = assignUserType(payload.dataValues)(USER_TYPE.CUSTOMER);
          const token = await generateJWT(tokenPayload);

          const rt = payload.get('refreshToken');

          return res.status(200).json({
            message: 'success',
            payload: R.omit(['refreshToken'])(withType),
            token: `Bearer ${token}`,
            refreshToken: rt
          });
        }
        if (err) {
          return next(err);
        }
        return res.status(400).json(info);
      }
    )(req, res, next);
  } catch (e) {
    return next(e);
  }
};

export const facebookCallback = async (req, res) => {
  try {
    const { id: facebookId } = req.user;
    const email = _.get(req, 'user.emails[0].value', null);

    let user = {};

    user = await Users.findOne({
      where: { facebookId }
    });

    if (!user) {
      const existingUser = await Users.findOne({ where: { email } });
      if (existingUser) {
        await existingUser.update({ facebookId });
      } else {
        await createFacebookUserAccount(req.user);
      }

      user = await Users.findOne({
        where: { facebookId },
        include: ['country', 'notificationSetting']
      });
    }

    const refreshToken = generateRefreshToken();

    await user.update({ refreshToken, lastLogin: new Date() });
    await user.increment('loginFrequency');
    await user.reload();

    const token = await generateJWT({
      id: user.id,
      type: USER_TYPE.CUSTOMER,
      countryId: user.countryId
    });

    return res.status(200).send(`
      <script>
        window.ReactNativeWebView.postMessage(
          ${JSON.stringify(
            JSON.stringify({
              status: true,
              payload: user,
              token: `Bearer ${token}`,
              refreshToken
            })
          )}
        );
      </script>
    `);
  } catch (e) {
    return res.status(200).send(`
      <script>
        window.ReactNativeWebView.postMessage(
          ${JSON.stringify(JSON.stringify({ status: false, message: e }))}
        );
      </script>
    `);
  }
};

export const googleCallback = async (req, res) => {
  try {
    const { id: googleId } = req.user;
    const { state: countryId } = req.query;
    const email = _.get(req, 'user.emails[0].value');
    let user = {};

    user = await Users.scope([{ method: ['byCountry', countryId] }]).findOne({
      where: { googleId }
    });

    if (_.isEmpty(user)) {
      const existingUser = await Users.scope([{ method: ['byCountry', countryId] }]).findOne({
        where: { email }
      });
      if (existingUser) {
        await existingUser.update({ googleId });
      } else {
        await createGoogleUserAccount(req.user, countryId);
      }
      user = await Users.scope([{ method: ['byCountry', countryId] }]).findOne({
        where: { googleId },
        include: ['notificationSetting', 'country']
      });
      // await sendMail(user.email, '', '', { verificationUrl: 'deeplink goes here' }, EMAIL_VERIFICATION);
    }

    const refreshToken = generateRefreshToken();
    await user.update({ refreshToken, lastLogin: new Date() });
    await user.increment('loginFrequency');

    const token = await generateJWT({
      id: user.id,
      type: USER_TYPE.CUSTOMER,
      countryId: user.countryId
    });

    return res.status(200).send(`
        <script>
          window.ReactNativeWebView.postMessage(
            ${JSON.stringify(
              JSON.stringify({
                status: true,
                payload: user,
                token: `Bearer ${token}`,
                refreshToken
              })
            )}
          );
        </script>
      `);
  } catch (e) {
    return res.status(200).send(`
      <script>
        window.ReactNativeWebView.postMessage(
          ${JSON.stringify(JSON.stringify({ status: false, message: e }))}
        );
      </script>
    `);
  }
};

export const verifyOTP = async (req, res, next) => {
  req.check('otp').exists();
  req.check('username').exists();
  req.check('password').exists();
  req.check('phoneCountryCode').exists();
  req.check('phoneNumber').exists();
  req.check('email').exists();
  try {
    await req.asyncValidationErrors();
    const { otp, email, username, password, phoneCountryCode, phoneNumber } = req.body;

    const countryId = await getCountryId(req);

    const existingOTP = await Otps.findOne({ where: { phoneCountryCode, phoneNumber } });

    if (!existingOTP) {
      throw new Error('Invalid phone number given');
    }

    // if (existingOTP.isVerified) {
    //   throw new Error('Your phone number has been verified.');
    // }

    if (existingOTP.otp !== otp) {
      throw new Error(
        `Sorry, we couldn't verify your phone number (${phoneCountryCode} ${phoneNumber}.)`
      );
    }

    if (existingOTP.otpValidity < new Date()) {
      throw new Error('OTP expired, please resend OTP again.');
    }

    const jsonData = await sequelize.transaction(async transaction => {
      const refreshToken = generateRefreshToken();

      const user = await Users.create(
        {
          email,
          countryId,
          password,
          phoneCountryCode,
          phoneNumber,
          username,
          refreshToken,
          isVerified: true
        },
        { transaction }
      );

      const omit = R.omit(['password', 'refreshToken']);
      const tokenPayload = { id: user.id, type: USER_TYPE.CUSTOMER, countryId: user.countryId };
      const jwt = await generateJWT(tokenPayload);
      const processedPayload = R.pipe(
        omit,
        assignUserType(R.__)(USER_TYPE.CUSTOMER)
      )(user.dataValues);

      await existingOTP.update({ isVerified: true }, { transaction });

      return {
        message: 'success',
        payload: processedPayload,
        token: `Bearer ${jwt}`,
        refreshToken
      };
    });

    authListener.emit(LISTENER_EVENT.AUTHENTICATION.SIGNUP, jsonData.payload);

    return res.status(200).json(jsonData);
  } catch (e) {
    return next(e);
  }
};

/**
 * Admin Authentication
 */

export const adminSignIn = async (req, res, next) => {
  req.check('email').exists();
  req.check('password').isLength({ min: 4 });
  try {
    await req.asyncValidationErrors();
    return passport.authenticate(
      'admin-login',
      async (err, admin, info) => {
        try {
          if (err || !admin) {
            const error = new Error(!err ? info.message : err);
            return next(error);
          }

          const payload = await Admins.findOne({
            where: { id: admin.id }
          });

          if (!payload.active) return next(new Error('This account is not active'));

          await payload.update({ lastLogin: new Date() });
          await payload.increment('loginFrequency');
          await payload.reload();

          const withType = assignUserType(payload.dataValues)(USER_TYPE.ADMIN);
          const token = await generateJWT(withType);
          res.cookie(Configs.adminAuthTokenName, token, {
            httpOnly: false
            // secure: true
            // domain: process.env.COOKIE_HOST
          });

          return res.json({
            message: 'Login in Successfully',
            payload: withType,
            token: `Bearer ${token}`
          });
        } catch (error) {
          return next(error);
        }
      },
      { session: false }
    )(req, res, next);
  } catch (e) {
    return next(e);
  }
};

export const adminRevoke = async (req, res, next) => {
  try {
    return passport.authenticate(
      Configs.passport.strategy.dashboard,
      { session: false },
      async (err, user, info) => {
        if (!user) return next(Error('Session Expired'));
        if (user) {
          const payload = await Admins.findOne({
            where: { id: user.id }
          });

          if (!payload.active) return next(new Error('This account is not active'));

          const withType = assignUserType(payload.dataValues)(USER_TYPE.ADMIN);
          const token = await generateJWT(withType);
          res.cookie(Configs.adminAuthTokenName, token, { httpOnly: false });
          return res.status(200).json({ message: 'Success revoke', payload: withType, token });
        }
        if (err) {
          return next(err);
        }
        return res.status(400).json(info);
      }
    )(req, res, next);
  } catch (e) {
    return next(e);
  }
};

export const userRegistration = async (req, res, next) => {
  try {
    requestValidator(req);

    const { username, email, phoneNumber, phoneCountryCode } = req.body;

    const userByUsername = await Users.findOne({
      where: { username }
    });

    if (!R.isNil(userByUsername)) {
      throw new Error('Username is not available');
    }

    const userByEmail = await Users.findOne({
      where: { email }
    });
    if (!R.isNil(userByEmail)) {
      throw new Error('email is not available');
    }

    const userByPhoneNumber = await Users.findOne({
      where: {
        phoneCountryCode,
        phoneNumber
      }
    });
    if (!R.isNil(userByPhoneNumber)) {
      throw new Error('Phone number is not available');
    }

    const existingOTP = await Otps.findOne({ where: { phoneCountryCode, phoneNumber } });
    const otp = generateOTP();

    // if (existingOTP && existingOTP.isVerified) {
    //   throw new Error('This phoneNumber has been verified');
    // }

    if (!R.isNil(existingOTP)) {
      await existingOTP.update({
        otp,
        otpValidity: moment().add(10, 'minutes'),
        isVerified: false
      });
    } else {
      await Otps.create({
        phoneCountryCode,
        phoneNumber,
        otp,
        otpValidity: moment().add(10, 'minutes')
      });
    }

    await sendSMS(`${phoneCountryCode}${phoneNumber}`, SMSVerifcation(otp));

    return res.status(200).json({
      message: 'success'
    });
  } catch (e) {
    return next(e);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    requestValidator(req);
    const { phoneCountryCode, phoneNumber } = req.body;

    const user = await Users.findOne({ where: { phoneCountryCode, phoneNumber } });

    if (!user) {
      throw new Error('Account not found, please register a new account with this phone number');
    }

    const otp = generateOTP();
    const otpValidity = moment().add(10, 'minutes');

    await sequelize.transaction(async transaction => {
      const existingOTP = await Otps.findOne({
        where: { phoneCountryCode, phoneNumber },
        transaction
      });

      if (!existingOTP) {
        await Otps.create({ phoneCountryCode, phoneNumber, otp, otpValidity }, { transaction });
      } else {
        await existingOTP.update({ otp, otpValidity, isVerifed: false }, { transaction });
      }

      await sendSMS(`${phoneCountryCode}${phoneNumber}`, SMSVerifcation(otp));
    });

    return res.status(200).json({
      message: 'success'
    });
  } catch (e) {
    return next(e);
  }
};

export const verifyForgotPasswordOTP = async (req, res, next) => {
  try {
    const { otp, phoneCountryCode, phoneNumber } = req.body;
    const existingOTP = await Otps.findOne({ where: { phoneCountryCode, phoneNumber } });

    if (otp !== existingOTP.otp) {
      throw new Error(
        `Sorry, we couldn't verify your phone number (${phoneCountryCode} ${phoneNumber}.)`
      );
    }

    if (new Date() > existingOTP.otpValidity) {
      throw new Error('OTP expired, please resend again');
    }

    await existingOTP.update({ isVerified: true });

    const user = await Users.findOne({ where: { phoneCountryCode, phoneNumber } });

    const jwt = await generateJWT(user.id, '5m');

    return res.status(200).json({ message: 'success', payload: jwt });
  } catch (e) {
    return next(e);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    requestValidator(req);
    const { password, userId } = req.body;
    await Users.update(
      {
        password: hashPassword(password),
        resetToken: null
      },
      { where: { id: userId } }
    );
    return res.status(200).json({
      message: 'success'
    });
  } catch (e) {
    return next(e);
  }
};

export const resendOTP = async (req, res, next) => {
  try {
    const { phoneCountryCode, phoneNumber } = req.body;

    const otp = generateOTP();
    const existingOTP = await Otps.findOne({ where: { phoneCountryCode, phoneNumber } });

    if (R.isNil(existingOTP)) {
      throw new Error('Invalid phone number given');
    }

    // if (existingOTP.isVerified) {
    //   throw new Error('You account has been verified');
    // }

    const otpValidity = moment().add(10, 'minutes');
    const completePhoneNumber = `${phoneCountryCode}${phoneNumber}`;

    await existingOTP.update({ otp, otpValidity, isVerified: false });
    await sendSMS(completePhoneNumber, SMSVerifcation(otp));

    return res.status(200).json({
      message: 'success'
    });
  } catch (e) {
    return next(e);
  }
};

export const appleSignIn = async (req, res, next) => {
  try {
    const { email, fullName, identityToken } = req.body;
    // const { userAppleId } = req.body;

    const { sub: userAppleId } = await AppleAuth.verifyIdToken(identityToken, {
      audience: AUTH_CONFIG.APPLE.CLIENT_ID,
      ignoreExpiration: true
    });

    if (!userAppleId) {
      throw new Error('Invalid identityToken given');
    }

    const existingUser = await Users.findOne({
      where: { appleId: userAppleId },
      include: [{ model: NotificationSettings, as: 'notificationSetting' }]
    });

    const user = await R.ifElse(
      R.isNil,
      async () => {
        const data = await createAppleUserAccount({ email, fullName, userAppleId });
        return Promise.resolve(data);
      },
      R.identity
    )(existingUser);

    const refreshToken = generateRefreshToken();
    await user.update({ refreshToken, lastLogin: new Date() });
    await user.increment('loginFrequency');
    await user.reload();

    const token = await generateJWT({ id: user.id, type: USER_TYPE.CUSTOMER });

    return res.status(200).json({
      message: 'success',
      payload: user,
      token,
      refreshToken
    });
  } catch (e) {
    return next(e);
  }
};
