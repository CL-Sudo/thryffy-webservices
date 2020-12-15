import Billplz from '@services/billplz.service';

import R from 'ramda';

import { Notifications } from '@models';

import crypto from 'crypto';

export const test = async (req, res, next) => {
  try {
    const { q } = req.query;
    const billplz = new Billplz();
    const isValid = billplz.verifyXSignature(req.body.x_signature, req.body);
    console.log('isValid', isValid);
    return res.status(200).json({
      message: 'not found',
      payload: isValid
    });
  } catch (e) {
    return next(e);
  }
};
