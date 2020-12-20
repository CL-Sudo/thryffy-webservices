import Billplz from '@services/billplz.service';

import R from 'ramda';

import { Notifications, Products } from '@models';

import crypto from 'crypto';

export const test = async (req, res, next) => {
  try {
    const { q } = req.query;
    const count = await Products.count({
      where: { id: [8, 9, 10, 18], isPurchased: false, isPublished: true }
    });
    console.log('count', count);
    return res.status(200).json({
      message: 'not found',
      payload: count
    });
  } catch (e) {
    return next(e);
  }
};
