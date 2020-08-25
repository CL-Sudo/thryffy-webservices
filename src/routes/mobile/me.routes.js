import Router from 'express';
import * as controllers from '@controllers/me.controller';
import * as validators from '@validators/me.validator';

const router = new Router();

router.post('/shipping', validators.addAddressValidator, controllers.addAddress);
router.get('/shipping', controllers.listAddress);
router.delete('/shipping/:addressId', controllers.removeAddress);

router.get('/order/:orderId', controllers.getOrderDetails);

router.patch('/password', validators.changePasswordValidator, controllers.changePassword);

router.put('/profile', controllers.updateProfile);

router.get('/reviews', controllers.getReview);

export default router;
