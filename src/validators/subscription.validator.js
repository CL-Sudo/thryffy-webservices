import { check } from 'express-validator/check';
import { Subscriptions, Packages } from '@models';

export const subscribeValidator = [
  check('packageId')
    .exists()
    .isLength({ min: 1 })
    .custom(async (packageId, { req }) => {
      const { id } = req.user;
      const pck = await Packages.findOne({ where: { id: packageId } });

      if (!pck) throw new Error('Invalid packageId given.');

      const currentSubscription = await Subscriptions.findOne({ where: { userId: id } });

      if (currentSubscription && currentSubscription.expiryDate > new Date()) {
        throw new Error('You subscription is not expired yet.');
      }

      return Promise.resolve();
    })
];
