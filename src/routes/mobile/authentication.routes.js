import Router from 'express';
import * as Controllers from '@controllers/authentication.controller';
import passport from 'passport';
import * as Configs from '@configs';
import * as validators from '@validators';
import { Countries, Users } from '@models';

import { generateTopicName, unsubscribeTokensFromTopic } from '@services/notification.service';

import NOTIFICATION from '@constants/notification.constant';
import { getCountryId } from '@utils/index';

const router = new Router();

const mobileAuth = passport.authenticate(Configs.passport.strategy.mobile, { session: false });

router.post('/login', Controllers.mobileSignIn);
router.post('/revoke', Controllers.mobileRevoke);
router.post('/register', validators.registrationValidator, Controllers.userRegistration);
router.post('/verify-otp', Controllers.verifyOTP);
router.post('/resend-otp', Controllers.resendOTP);
router.post('/forgot-password', validators.forgotPasswordValidator, Controllers.forgotPassword);
router.patch('/reset-password', validators.resetPasswordValidator, Controllers.resetPassword);
router.post('/forgot-password/verify-otp', Controllers.verifyForgotPasswordOTP);
router.post('/logout', mobileAuth, async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await Users.findOne({
      where: { id }
    });
    await unsubscribeTokensFromTopic(
      user.deviceToken,
      generateTopicName(NOTIFICATION.TOPIC.MARKETING, user.countryId)
    );
    await user.update({ deviceToken: null });
    return res.status(200).json({ message: 'Logout successfuly' });
  } catch (e) {
    return next(e);
  }
});

router.get('/facebook', (req, res, next) => {
  passport.authenticate('facebook', {
    scope: ['email'],
    callbackURL: `${process.env.FACEBOOK_CALLBACK_URL}`
  })(req, res, next);
});
router.get(
  '/facebook/callback',
  (req, res, next) => {
    passport.authenticate('facebook', {
      session: false,
      callbackURL: `${process.env.FACEBOOK_CALLBACK_URL}`
    })(req, res, next);
  },
  Controllers.facebookCallback
);

router.get('/google', async (req, res, next) => {
  try {
    const countryId = await getCountryId(req);

    return passport.authenticate('google', {
      state: countryId,
      scope: ['profile', 'email'],
      session: false
    })(req, res, next);
  } catch (e) {
    return next(e);
  }
});

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  Controllers.googleCallback
);

router.post('/apple', Controllers.appleSignIn);

export default router;
