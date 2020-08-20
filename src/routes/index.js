/* eslint-disable global-require */
import passport from 'passport';
import { test } from '@controllers';
import * as Config from '@configs';
// import authentication from './authentication.routes';
// import commonsRoutes from './commons.routes';

const adminAuth = passport.authenticate(Config.passport.strategy.dashboard, { session: false });
const mobileAuth = passport.authenticate(Config.passport.strategy.mobile, { session: false });

export default app => {
  /*
   * Private API
   */
  app.use('/api/mobile/products', mobileAuth, require('./mobile/products.routes').default);
  app.use('/api/mobile/cart', mobileAuth, require('./mobile/cart.routes').default);
  app.use('/api/mobile/checkout', mobileAuth, require('./mobile/checkout.routes').default);
  app.use('/api/mobile/favourites', mobileAuth, require('./mobile/favourites.routes').default);
  app.use('/api/mobile/me', mobileAuth, require('./mobile/me.routes').default);
  /*
   * PUBLIC API
   */
  app.use('/api/mobile/auth/', require('./mobile/authentication.routes').default);
  app.use('/api/admin/auth', require('./authentication.routes').default);

  app.use('/api/test', test);
  /*
   * COMMONS API
   */
  // app.use('/api/commons/', auth, commonsRoutes);
};
