import R from 'ramda';
import { Products } from '@models';
import * as utils from '@utils';
// import testEmitter from '../listeners/test.listener';

export const test = async (req, res, next) => {
  try {
    const result = utils.parseFirstNameLastName(req.body.var);

    return res.status(200).json({
      message: 'success',
      result,
      trimmed: R.trim(' lau ching ')
    });
  } catch (e) {
    return next(e);
  }
};
