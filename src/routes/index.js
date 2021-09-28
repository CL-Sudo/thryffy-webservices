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
  app.use('/api/notifications', adminAuth, require('./notifications.routes').default);
  app.use('/api/tracking', adminAuth, require('./tracking.routes').default);
  app.use('/api/comments', adminAuth, require('./comments.routes').default);
  app.use('/api/reports', adminAuth, require('./reports.routes').default);
  app.use('/api/packages', adminAuth, require('./packages.routes').default);
  app.use('/api/commissions', adminAuth, require('./commissions.routes').default);
  app.use(
    '/api/free-commission-campaigns',
    adminAuth,
    require('./commission_free_campaign.routes').default
  );
  app.use('/api/countries', adminAuth, require('./country.routes').default);

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

  app.use(
    '/api/mobile/notification-settings',
    mobileAuth,
    require('./mobile/notification_settings.routes').default
  );
  app.use('/api/mobile/comments', mobileAuth, require('./mobile/comments.routes').default);
  app.use('/api/mobile/users', require('./mobile/users.routes').default);
  app.use('/api/mobile/followings', mobileAuth, require('./mobile/followings.routes').default);
  app.use('/api/mobile/trackings', mobileAuth, require('./mobile/trackings.routes').default);

  /*
   * PUBLIC API
   */
  app.use('/api/auth', require('./authentication.routes').default);
  app.use('/api/mobile/auth/', require('./mobile/authentication.routes').default);
  app.use('/api/publics', require('./publics.routes').default);
  app.use('/api/mobile/conditions', require('./mobile/conditions.routes').default);

  app.use('/api/test', test);

  app.use('/s', require('./mobile/shares.routes').default);
  /*
   * COMMONS API
   */
  // app.use('/api/commons/', auth, commonsRoutes);
};
