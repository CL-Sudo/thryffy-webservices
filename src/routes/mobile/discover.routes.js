import Router from 'express';
import * as controllers from '@controllers/discover.controller';
import * as validators from '@validators/discover.validator';

const router = new Router();

router.get('/home', validators.homeValidator, controllers.home);
router.get('/', validators.listValidator, controllers.discoverList);
router.get('/search-brand', validators.searchBrandValidator, controllers.searchBrand);
router.get('/suggestion', validators.autocompleteValidator, controllers.autocomplete);

export default router;
