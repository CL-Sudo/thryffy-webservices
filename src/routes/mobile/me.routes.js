import Router from 'express';
import * as controllers from '@controllers/me.controller';
import * as validators from '@validators/me.validator';

const router = new Router();

router.post('/addresses', validators.addAddressValidator, controllers.addAddress);
router.get('/addresses', controllers.listAddress);
router.delete('/addresses/:addressId', controllers.removeAddress);
router.put('/addresses/:addressId', validators.addAddressValidator, controllers.updateAddress);
router.patch('/addresses/:addressId/set-default', controllers.setDefaultAddress);

router.get('/order/:orderId', controllers.getOrderDetails);

router.patch('/password', validators.changePasswordValidator, controllers.changePassword);

router.put('/profile', controllers.updateProfile);

router.get('/reviews', controllers.getReview);

export default router;
