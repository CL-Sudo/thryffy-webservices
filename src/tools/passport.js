import passport from 'passport';
import passportLocal from 'passport-local';
import passportJWT from 'passport-jwt';
// import FacebookStrategy from 'passport-facebook';
// import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import _ from 'lodash';
import { getCookie } from '@utils/cookie.util';
import * as Config from '@configs';
import { Users, Admins } from '@models';
// import { USER_TYPE } from '@constants';

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const LocalStrategy = passportLocal.Strategy;

passport.use(
  'login',
  new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async (email, password, done) => {
    try {
      const user = await Users.unscoped().findOne({ where: { email: _.toLower(email) } });

      if (!user) return done(null, false, { message: "User account doesn't exist" });
      if (!user.registered) return done(null, false, { message: `User account doesn't exist` });
      if (_.toLower(process.env.NODE_ENV) !== 'dev') {
        if (!user.emailVerified) return done(null, false, { message: `Please verify your email account` });
      }
      if (!user.active) return done(null, false, { message: 'This account is not active' });

      const validPassword = await user.comparePassword(password);
      if (!validPassword) return done(null, false, { message: 'Password is incorrect, please try again...' });

      return done(null, user, { message: 'Logged in Successfully' });
    } catch (error) {
      return done(error);
    }
  })
);

passport.use(
  'adminLogin',
  new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async (email, password, done) => {
    try {
      const admin = await Admins.unscoped().findOne({
        where: { email: _.toLower(email) }
      });

      if (!admin) return done(null, false, { message: "Admin account doesn't exist" });
      // if (!user.active) {
      //   return done(null, false, { message: 'This account is not active' });
      // }

      const validPassword = await admin.comparePassword(password);
      if (!validPassword) {
        return done(null, false, { message: 'Password is incorrect, please try again...' });
      }

      return done(null, admin, { message: 'Logged in Successfully' });
    } catch (error) {
      return done(error);
    }
  })
);

const portalJwtStrategyCallback = (req, token, done) => {
  try {
    req.authData = token.authData;
    req.body = _.omit(req.body, ['id', 'createdAt', 'updatedAt', 'deletedAt', 'createdBy', 'updatedBy', 'createdBy', 'deletedBy']);

    switch (req.method) {
      case 'POST':
        req.body.createdBy = token.authData.id;
        break;
      case 'PUT':
        req.body.updatedBy = token.authData.id;
        break;
      case 'DELETE':
        req.body.deletedBy = token.authData.id;
        break;
      case 'PATCH':
        req.body.updatedBy = token.authData.id;
        break;
      default:
        break;
    }
    return done(null, token.authData);
  } catch (error) {
    return done(error);
  }
};

const adminJwtStrategyCallback = (req, token, done) => {
  try {
    req.authData = token.authData;
    req.body = _.omit(req.body, ['id', 'createdAt', 'updatedAt', 'deletedAt', 'createdBy', 'updatedBy', 'createdBy', 'deletedBy']);

    switch (req.method) {
      case 'POST':
        req.body.createdBy = token.authData.id;
        break;
      case 'PUT':
        req.body.updatedBy = token.authData.id;
        break;
      case 'DELETE':
        req.body.deletedBy = token.authData.id;
        break;
      case 'PATCH':
        req.body.updatedBy = token.authData.id;
        break;
      default:
        break;
    }
    return done(null, token.authData);
  } catch (error) {
    return done(error);
  }
};

passport.use(
  Config.passport.strategy.dashboard,
  new JWTStrategy(
    {
      secretOrKey: Config.jwt.secret,
      jwtFromRequest: ExtractJWT.fromExtractors([getCookie(Config.adminAuthTokenName)]),
      passReqToCallback: true
    },
    adminJwtStrategyCallback
  )
);

passport.use(
  Config.passport.strategy.portal,
  new JWTStrategy(
    {
      secretOrKey: Config.jwt.secret,
      jwtFromRequest: ExtractJWT.fromExtractors([getCookie()]),
      passReqToCallback: true
    },
    portalJwtStrategyCallback
  )
);

// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_APP_ID,
//       clientSecret: process.env.FACEBOOK_APP_SECRET,
//       callbackURL: `${process.env.SERVER_URL}${process.env.FACEBOOK_CALLBACK_URL}`,
//       profileFields: ['id', 'displayName', 'photos', 'email']
//     },
//     (accessToken, refreshToken, profile, done) => {
//       try {
//         return done(null, profile);
//       } catch (error) {
//         return done(error);
//       }
//     }
//   )
// );

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: `${process.env.SERVER_URL}${process.env.GOOGLE_CALLBACK_URL}`
//     },
//     (token, tokenSecret, profile, done) => {
//       try {
//         return done(null, profile);
//       } catch (error) {
//         return done(error);
//       }
//     }
//   )
// );

// passport.use(
//   new LinkedInStrategy(
//     {
//       clientID: process.env.LINKEDIN_CLIENT_ID,
//       clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
//       callbackURL: `${process.env.SERVER_URL}/${process.env.LINKEDIN_CALLBACK_URL}`,
//       scope: ['r_emailaddress', 'r_liteprofile']
//     },
//     (accessToken, refreshToken, profile, done) => {
//       try {
//         return done(null, profile);
//       } catch (error) {
//         return done(error);
//       }
//     }
//   )
// );
