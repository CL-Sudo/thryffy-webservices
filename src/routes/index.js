/* eslint-disable global-require */
import passport from 'passport';
import * as Config from '@configs';
// import authentication from './authentication.routes';
// import commonsRoutes from './commons.routes';

const auth = passport.authenticate(Config.passport.strategy.portal, { session: false });
const adminAuth = passport.authenticate(Config.passport.strategy.dashboard, { session: false });

export default app => {
  /*
   * Private API
   */

  /*
   * PUBLIC API
   */
  // app.use('/api/auth/', authentication);

  /*
   * COMMONS API
   */
  // app.use('/api/commons/', auth, commonsRoutes);
};
