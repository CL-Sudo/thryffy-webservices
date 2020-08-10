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
