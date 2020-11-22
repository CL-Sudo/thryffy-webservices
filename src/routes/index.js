/* eslint-disable global-require */
import passport from 'passport';
import { test } from '@controllers';
import * as Config from '@configs';
// import authentication from './authentication.routes';
// import commonsRoutes from './commons.routes';

const adminAuth = passport.authenticate(Config.passport.strategy.dashboard, { session: false });
const mobileAuth = passport.authenticate(Config.passport.strategy.mobile, { session: false });

export default app => {
  /**
   * Admin API
   */
  app.use('/api/admins', adminAuth, require('./admin.routes').default);
  app.use('/api/customers', adminAuth, require('./customer.routes').default);
  app.use('/api/categories', adminAuth, require('./category.routes').default);
  app.use('/api/products', adminAuth, require('./product.routes').default);
  app.use('/api/sizes', adminAuth, require('./size.routes').default);
  app.use('/api/banners', adminAuth, require('./banner.routes').default);
  app.use('/api/finances', adminAuth, require('./finances.routes').default);
  app.use('/api/users', adminAuth, require('./users.routes').default);
  app.use('/api/feature-items', adminAuth, require('./feature_items.routes').default);

  /*
   * Private API
   */
  app.use('/api/mobile/cart', mobileAuth, require('./mobile/cart.routes').default);
  app.use('/api/mobile/categories', mobileAuth, require('./mobile/categories.routes').default);
  app.use('/api/mobile/discover', mobileAuth, require('./mobile/discover.routes').default);
  app.use('/api/mobile/favourites', mobileAuth, require('./mobile/favourites.routes').default);
  app.use('/api/mobile/me', mobileAuth, require('./mobile/me.routes').default);
  app.use('/api/mobile/reviews', mobileAuth, require('./mobile/review.routes').default);
  app.use('/api/mobile/products', mobileAuth, require('./mobile/products.routes').default);
  app.use('/api/mobile/seller', mobileAuth, require('./mobile/seller.routes').default);
  app.use('/api/mobile/sizes', mobileAuth, require('./mobile/sizes.routes').default);
  app.use('/api/mobile/contact-us', mobileAuth, require('./mobile/contact_us.routes').default);
  app.use('/api/mobile/disputes', mobileAuth, require('./mobile/dispute.routes').default);
  app.use('/api/mobile/notifications', mobileAuth, require('./mobile/notification.routes').default);
  app.use(
    '/api/mobile/subscriptions',
    mobileAuth,
    require('./mobile/subscriptions.routes').default
  );
  app.use('/api/mobile/packages', mobileAuth, require('./mobile/packages.routes').default);
  app.use('/api/mobile/home', mobileAuth, require('./mobile/home.routes').default);

  /*
   * PUBLIC API
   */
  app.use('/api/auth', require('./authentication.routes').default);
  app.use('/api/mobile/auth/', require('./mobile/authentication.routes').default);

  app.use('/api/test', test);
  /*
   * COMMONS API
   */
  // app.use('/api/commons/', auth, commonsRoutes);
};
