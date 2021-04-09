import R from 'ramda';

import * as Models from '@models';

export const test = async (req, res, next) => {
  try {
    const { q } = req.query;

    return res.status(200).json({
      message: 'not found'
    });
  } catch (e) {
    return next(e);
  }
};
