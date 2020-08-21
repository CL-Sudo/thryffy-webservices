import Router from 'express';
import * as Controllers from '@controllers/authentication.controller';
import passport from 'passport';
import * as Configs from '@configs';
import * as validators from '@validators';

const router = new Router();

const mobileAuth = passport.authenticate(Configs.passport.strategy.mobile, { session: false });

router.post('/login', Controllers.mobileSignIn);
router.post('/phone-login', Controllers.phoneNoSignIn);
router.post('/revoke', Controllers.mobileRevoke);
router.post('/register', validators.registrationValidator, Controllers.userRegistration);
router.post('/verify-otp', mobileAuth, Controllers.verifyOTP);
router.post('/forgot-password', validators.forgotPasswordValidator, Controllers.forgotPassword);
router.patch('/reset-password', validators.resetPasswordValidator, Controllers.resetPassword);

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
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { session: false }), Controllers.googleCallback);

export default router;
