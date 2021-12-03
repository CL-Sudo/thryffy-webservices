import { check } from 'express-validator/check';
import { Packages } from '@models';

export const subscribeValidator = [
  check('packageId')
    .exists()
    .isLength({ min: 1 })
    .custom(async (packageId, { req }) => {
      const pck = await Packages.scope([{ method: ['byCountry', req.user.countryId] }]).findOne({
        where: { id: packageId }
      });

      if (!pck) throw new Error('Invalid packageId given.');
      return Promise.resolve();
    })
];
