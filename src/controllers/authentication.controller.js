import R from 'ramda';
import _ from 'lodash';
import passport from 'passport';
import { Users, Admins } from '@models';
import * as Configs from '@configs';
import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';
import {
  generateRefreshToken,
  generateJWT,
  generateOTP,
  generateResetToken,
  generateUsername
} from '@utils/auth.util';
import { USER_TYPE } from '@constants/index';
import { authListener } from '@listeners';
import { requestValidator } from '@validators';
import { hashPassword } from '@tools/bcrypt';
import moment from 'moment';
import { sendSMS } from '@services/sms.service';
import { SMSVerifcation } from '@templates/sms.template';
// import { sendMail } from '@tools/sendgrid';

const assignUserType = user => type => R.assoc('type', type)(user);

const createFacebookUserAccount = provider =>
  new Promise(async (resolve, reject) => {
    const { id: facebookId, displayName } = provider;
    const email = _.get(provider, 'emails[0].value', null);
    const username = await generateUsername(displayName, null);
    const transaction = await sequelize.transaction();
    // const { firstName, lastName } = parseFirstNameLastName(displayName);
    try {
      await Users.create(
        {
          username,
          facebookId,
          email,
          fullName: displayName
        },
        { transaction }
      );
      authListener.emit('userSignUp');
      await transaction.commit();
      return resolve();
    } catch (e) {
      await transaction.rollback();
      return reject(e);
    }
  });

const createGoogleUserAccount = async provider =>
  new Promise(async (resolve, reject) => {
    const transaction = await sequelize.transaction();
    try {
      const { id: googleId, displayName } = provider;
      const email = _.get(provider, 'emails[0].value');
      const username = await generateUsername(displayName, null);
      // const { firstName, lastName } = parseFirstNameLastName(displayName);
      await Users.create(
        {
          username,
          googleId,
          email,
          fullName: displayName
        },
        { transaction }
      );
      await transaction.commit();
      return resolve();
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
      async (err, user, info) => {
        try {
          if (err) return next(err);
          if (!user) return next(new Error(info.message));

          if (!user.isVerified) {
            const otp = generateOTP();
            await Users.update(
              { otp, otpValidity: moment().add(10, 'minutes') },
              { where: { id: user.id } }
            );
            await sendSMS(user.completePhoneNumber, SMSVerifcation(otp));
            return res.status(202).json({
              message: 'user not verified'
            });
          }

          const userData = async () => {
            try {
              const data = await Users.findOne({
                where: { id: user.id }
              });
              return Promise.resolve(data);
            } catch (e) {
              return Promise.reject(e);
            }
          };

          const isUserActivated = R.ifElse(R.prop('active'), R.identity, () => {
            throw new Error('User is not activated');
          });

          const getRefreshToken = u => {
            const refreshToken = generateRefreshToken();
            u.update({ refreshToken });
            return u;
          };

          const logUserActivity = u => {
            try {
              u.update({ lastLogin: new Date() });
              u.update({ loginFrequency: u.loginFrequency + 1 });
              u.reload();
              return u;
            } catch (e) {
              return Promise.reject(e);
            }
          };

          const getJWT = async u => {
            try {
              const jwt = await generateJWT(assignUserType({ id: u.id })(USER_TYPE.CUSTOMER));
              const omit = R.omit(['refreshToken', 'tac']);
              return Promise.resolve({
                user: assignUserType(omit(u.dataValues))(USER_TYPE.CUSTOMER),
                token: `Bearer ${jwt}`,
                refreshToken: u.refreshToken
              });
            } catch (e) {
              return Promise.reject(e);
            }
          };

          const payload = await R.compose(
            await getJWT,
            logUserActivity,
            getRefreshToken,
            isUserActivated
          )(await userData());
          return res.status(200).json({
            message: 'success',
            payload: {
              ...payload.user
            },
            token: payload.token,
            refreshToken: payload.refreshToken
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
            where: { id: loggedInUser.id }
          });

          if (!payload.active) {
            return next(new Error('Inactive account'));
          }
          const withType = assignUserType(payload.dataValues)(USER_TYPE.CUSTOMER);
          const token = await generateJWT(withType);
          const rf = payload.get('refreshToken');

          return res.json({
            message: 'Logged in successfully',
            payload: R.omit(['refreshToken'])(withType),
            token: `Bearer ${token}`,
            refreshToken: rf
          });
        }

        if (user) {
          const payload = await Users.findOne({
            where: { id: user.id }
          });
          if (!payload.active) {
            throw new Error('This account is not active');
          }
          const tokenPayload = { id: user.id, type: USER_TYPE.CUSTOMER };
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
      raw: true,
      attributes: ['id'],
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
        raw: true,
        attributes: ['id'],
        where: { facebookId }
      });
    }

    const refreshToken = generateRefreshToken();

    user.update({ refreshToken, lastLogin: new Date() });
    user.increment('loginFrequency');
    user.reload();

    const token = await generateJWT({ id: user.id, type: USER_TYPE.CUSTOMER });

    res.cookie(Configs.authTokenName, token, { httpOnly: false });

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
    const email = _.get(req, 'user.emails[0].value');
    let user = {};
    user = await Users.findOne({
      raw: true,
      attributes: ['id'],
      where: { googleId }
    });

    if (_.isEmpty(user)) {
      const existingUser = await Users.findOne({
        where: { email }
      });
      if (existingUser) {
        await existingUser.update({ googleId });
      } else {
        await createGoogleUserAccount(req.user);
      }

      user = await Users.findOne({
        where: { googleId },
        attributes: ['id', 'email']
      });
      // await sendMail(user.email, '', '', { verificationUrl: 'deeplink goes here' }, EMAIL_VERIFICATION);
    }

    const refreshToken = generateRefreshToken();
    user.update({ refreshToken, lastLogin: new Date() });
    user.increment('loginFrequency');
    user.reload();

    const token = await generateJWT({ id: user.id, type: USER_TYPE.CUSTOMER });
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
  try {
    await req.asyncValidationErrors();
    const { otp, email } = req.body;

    const getUser = async () => {
      try {
        const userByEmail = await Users.findOne({
          where: { email }
        });

        const userByUsername = await Users.findOne({
          where: { username: email }
        });

        if (R.isNil(userByEmail) && R.isNil(userByUsername)) {
          throw new Error('User not found');
        }

        return R.isNil(userByEmail) ? userByUsername : userByEmail;
      } catch (e) {
        throw e;
      }
    };

    const verifyTac = tacFromRequest => user => {
      if (tacFromRequest !== user.otp || user.otpValidity < new Date()) {
        throw new Error(
          `Sorry, we couldn't verify your phone number (+${user.phoneCountryCode} ${user.phoneNumber}.)`
        );
      }

      user.update({ isVerified: true, otp: null, otpValidity: null });
      return user;
    };

    await R.pipe(verifyTac(otp))(await getUser());

    return res.status(200).json({
      message: 'success'
    });
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

          payload.update({ lastLogin: new Date() });
          payload.increment('loginFrequency');
          payload.reload();

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

    const checkUserByEmail = async requestBody => {
      try {
        const user = await Users.findOne({
          raw: true,
          where: { email: requestBody.email }
        });
        if (R.not(R.isNil(user))) {
          throw new Error('email is not available');
        }
        return Promise.resolve(requestBody);
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const checkUserByPhoneNumber = async requestBody => {
      try {
        const user = await Users.findOne({
          raw: true,
          where: { phoneNumber: requestBody.phoneNumber }
        });
        if (R.not(R.isNil(user))) {
          throw new Error('Phone number is not available');
        }
        return Promise.resolve(requestBody);
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const checkUsername = async requestBody => {
      try {
        const user = await Users.findOne({
          raw: true,
          where: { username: requestBody.username }
        });
        if (R.not(R.isNil(user))) {
          throw new Error('Username is not available');
        }
        return Promise.resolve(requestBody);
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const createNewUser = async requestBody => {
      try {
        const refreshToken = generateRefreshToken();
        const otp = generateOTP();
        const otpValidity = moment().add(10, 'minutes');
        const user = await Users.create({ ...requestBody, refreshToken, otp, otpValidity });
        authListener.emit('userSignUp', user);
        return Promise.resolve(user);
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const generateJwt = async user => {
      try {
        const omit = R.omit(['password', 'refreshToken', 'otp', 'otpValidity']);
        const tokenPayload = { id: user.id, type: USER_TYPE.CUSTOMER };
        const jwt = await generateJWT(tokenPayload);
        const processedPayload = R.pipe(
          omit,
          assignUserType(R.__)(USER_TYPE.CUSTOMER)
        )(user.dataValues);
        return Promise.resolve({ jwt, user: processedPayload, refreshToken: user.refreshToken });
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const payload = await R.pipeP(
      checkUsername,
      checkUserByEmail,
      checkUserByPhoneNumber,
      createNewUser,
      generateJwt
    )(req.body);

    return res.status(200).json({
      message: 'success',
      payload: payload.user,
      refreshToken: payload.refreshToken,
      token: `Bearer ${payload.jwt}`
    });
  } catch (e) {
    return next(e);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email, userId } = req.body;

    const resetToken = await generateResetToken(email);

    const user = await Users.findOne({ where: { id: userId } });
    user.update({ resetToken });

    // const redirectUrl = `thryffy://reset-password/${resetToken}`;
    // await sendMail(user.email, user.firstName, user.lastName, { redirectUrl });

    return res.status(200).json({
      message: 'success'
    });
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
    const { id } = req.user;
    const user = await Users.findOne({
      attributes: ['id', 'phoneNumber', 'phoneCountryCode', 'isVerified'],
      where: { id }
    });

    if (user.isVerified) throw new Error('You account has been verified');

    const otp = generateOTP();
    const otpValidity = moment().add(10, 'minutes');
    const phoneNumber = `${user.phoneCountryCode}${user.phoneNumber}`;

    user.update({ otp, otpValidity });
    await sendSMS(phoneNumber, SMSVerifcation(otp));

    return res.status(200).json({
      message: 'success'
    });
  } catch (e) {
    return next(e);
  }
};
