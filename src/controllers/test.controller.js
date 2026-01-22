import * as _ from 'lodash';

export const test = async (req, res, next) => {
  try {
    res.status(404).json({
      message: 'Not Found'
    });
  } catch (e) {
    return next(e);
  }
};
