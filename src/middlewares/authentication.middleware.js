import Passport from 'passport';

export default (req, res, next) =>
  Passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (user) {
      return next();
    }
    return res.status(400).json(info);
  })(req, res, next);
