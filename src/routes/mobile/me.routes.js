import Router from 'express';
import * as controllers from '@controllers/me.controller';
import * as validators from '@validators/me.validator';

import { crud } from '@utils/controller-crud.util';
import { Preferences } from '@models';

const crudController = crud(Preferences);

const router = new Router();

router.get('/', controllers.getMyProfile);

router.post('/addresses', validators.addAddressValidator, controllers.addAddress);
router.get('/addresses', controllers.listAddress);
router.get('/addresses/:addressId', validators.getOneAddressValidator, controllers.getOneAddress);
router.delete('/addresses/:addressId', controllers.removeAddress);
router.put('/addresses/:addressId', validators.addAddressValidator, controllers.updateAddress);
router.patch('/addresses/:addressId/set-default', controllers.setDefaultAddress);

router.get('/orders/:orderId', controllers.getOrderDetails);
router.get('/orders', controllers.listOrders);

router.patch('/password', validators.changePasswordValidator, controllers.changePassword);

router.put('/profile', controllers.updateProfile);

router.get('/reviews', controllers.getReview);

router.patch(
  '/confirm-order',
  validators.confirmOrderReceivedValidator,
  controllers.confirmOrderReceived
);

// router.get('/products/recommendations', controllers.recommendProducts);

router.patch('/device-token', controllers.updateDeviceToken);

router
  .route('/preferences')
  .put(validators.updatePreferencesValidator, controllers.updatePreferences)
  .get(controllers.getPreferences);

router.get('/subscriptions', controllers.getOneSubscription);

export default router;
