import Router from 'express';
import { getCuratedList, getFeatureItemsList } from '@controllers/home.controller';

const router = new Router();

router.route('/curated').get(getCuratedList);
router.route('/feature-items').get(getFeatureItemsList);
// router.route('/banners').get(getBannersList);

export default router;
