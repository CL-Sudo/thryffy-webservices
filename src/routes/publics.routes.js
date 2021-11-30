import Router from 'express';
import {
  billplzCallback,
  subscribeCallback,
  subscriptionRedirect,
  billplzRedirect,
  trackingMoreWebHook,
  senangpayCallback,
  senangpayRedirect,
  beepPayCallback
} from '@controllers/public.controller';

import {
  getBannersList,
  getFeatureItemsList,
  publicCuratedList
} from '@controllers/home.controller';

import { search } from '@controllers/users.controller';
import { searchValidator } from '@validators/users.validator';

import * as controllers from '@controllers/discover.controller';
import * as validators from '@validators/discover.validator';

import { getOne, youMayAlsoLike } from '@controllers/product.controller';

import { getSellerDetail, getSellerCategories, getProducts } from '@controllers/seller.controller';
import Countries from '@models/countries.model';

const router = new Router();

router.route('/billplz/callback').post(billplzCallback);
router.route('/billplz/redirect').get(billplzRedirect);

router.route('/subscriptions/callback').post(subscribeCallback);
router.route('/subscriptions/redirect').get(subscriptionRedirect);

router.get('/discover/home', validators.homeValidator, controllers.home);
router.get('/discover', validators.listValidator, controllers.discoverList);
router.get('/discover/search-brand', validators.searchBrandValidator, controllers.searchBrand);

router.get('/home/feature-items', getFeatureItemsList);
router.get('/home/banners', getBannersList);
router.get('/home/curated', publicCuratedList);

router.get('/products/:productId', getOne);

router.get('/products/:productId/recommendations', youMayAlsoLike);

router.post('/trackingmore/webhook', trackingMoreWebHook);

router.get('/users/search', searchValidator, search);

router.all('/senangpay/callback', senangpayCallback);
router.all('/senangpay/redirect', senangpayRedirect);

router.get('/seller/:sellerId/details', getSellerDetail);
router.get('/seller/:sellerId/categories', getSellerCategories);
router.get('/seller/:sellerId/products', getProducts);

router.get('/country', async (req, res, next) => {
  try {
    const country = await Countries.findOne({ where: { code: req.query.countryCode || '' } });

    res.status(200).json({ message: 'success', payload: country });
  } catch (e) {
    next(e);
  }
});

router.all('/beep-pay-callback', beepPayCallback);

export default router;
