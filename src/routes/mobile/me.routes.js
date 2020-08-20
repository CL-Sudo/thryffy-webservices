import Router from 'express';
import * as controllers from '@controllers/me.controller';
import * as validators from '@validators/me.validator';

const router = new Router();

router.post('/shipping', validators.addAddressValidator, controllers.addAddress);
router.get('/shipping', controllers.listAddress);
router.delete('/shipping/:addressId', controllers.removeAddress);

export default router;
