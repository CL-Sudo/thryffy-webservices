import R from 'ramda';
import _ from 'lodash';
import passport from 'passport';
import { Users, Admins } from '@models';
import * as Configs from '@configs';
import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';
import { generateRefreshToken, generateJWT } from '@utils/auth.util';
import { USER_TYPE } from '@constants/index';

const assignUserType = user => type => {
  return R.assoc('type', type)(user);
};

const createFacebookUserAccount = provider =>
  new Promise(async (resolve, reject) => {
    const { id: facebookId, displayName } = provider;
    const email = _.get(provider, 'emails[0].value', null);
    const transaction = await sequelize.transaction();
    try {
      await Users.create(
        {
          facebookId,
          email,
          lastName: displayName
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

export const createGoogleUserAccount = async provider =>
  new Promise(async (resolve, reject) => {
    const transaction = await sequelize.transaction();
    try {
      const { id: googleId, displayName } = provider;
      const email = _.get(provider, 'emails[0].value');
      await Users.create(
        {
          googleId,
          email,
          lastName: displayName
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
    .exists()
    .withMessage('Must contain email.');

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

          const userData = async () => {
            try {
              const data = await Users.findOne({
                where: { id: user.id }
              });
              return data;
            } catch (e) {
              throw new Error(e);
            }
          };

          const isUserActivated = R.ifElse(R.prop('active')(R.__), R.identity(R.__), () => {
            throw new Error('User is not activated');
          });

          const getRefreshToken = u => {
            const refreshToken = generateRefreshToken();
            return { u, rt: refreshToken };
          };

          const logUserActivity = ({ u, rt }) => {
            try {
              u.update({ lastLogin: new Date() });
              u.update({ loginFrequency: u.loginFrequency + 1 });
              u.update({ refreshToken: rt });
              u.reload();
              return { u, rt };
            } catch (e) {
              throw new Error(e);
            }
          };

          const getJWT = async ({ u, rt }) => {
            try {
              const jwt = await generateJWT(assignUserType(u.dataValues)(USER_TYPE.CUSTOMER));
              const omitRefreshToken = R.omit(['refreshToken']);
              return { user: assignUserType(omitRefreshToken(u.dataValues))(USER_TYPE.CUSTOMER), token: jwt, refreshToken: rt };
            } catch (e) {
              throw new Error(e);
            }
          };

          const payload = await R.compose(await getJWT, logUserActivity, getRefreshToken, isUserActivated)(await userData());
          return res.status(200).json({
            message: 'success',
            payload
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
    return passport.authenticate(Configs.passport.strategy.mobile, { session: false }, async (err, user, info) => {
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
        const withType = assignUserType(payload.dataValues)(USER_TYPE.CUSTOMER);
        const token = await generateJWT(withType);

        const rt = payload.get('refreshToken');

        return res.status(200).json({
          message: 'success',
          payload: R.omit(['refreshToken'])(withType),
          token,
          refreshToken: rt
        });
      }
      if (err) {
        return next(err);
      }
      return res.status(400).json(info);
    })(req, res, next);
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
    await Users.update({ refreshToken }, { where: { id: user.id } });
    user = await Users.findOne({
      where: { facebookId }
    });

    const token = await generateJWT(user);

    res.cookie(Configs.authTokenName, token, { httpOnly: false });

    return res.status(200).send(`
      <script>
        window.ReactNativeWebView.postMessage(
          ${JSON.stringify(
            JSON.stringify({
              status: true,
              payload: user,
              token,
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
    await Users.update({ refreshToken }, { where: { id: user.id } });

    user = await Users.findOne({
      where: { googleId }
    });

    const token = await generateJWT(user);
    return res.status(200).send(`
        <script>
          window.ReactNativeWebView.postMessage(
            ${JSON.stringify(
              JSON.stringify({
                status: true,
                payload: user,
                token,
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

          return res.json({ message: 'Login in Successfully', payload: withType, token: `Bearer ${token}` });
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
    return passport.authenticate(Configs.passport.strategy.dashboard, { session: false }, async (err, user, info) => {
      console.log('user', user);
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
    })(req, res, next);
  } catch (e) {
    return next(e);
  }
};
