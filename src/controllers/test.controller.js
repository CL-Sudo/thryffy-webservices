import R from 'ramda';
// import testEmitter from '../listeners/test.listener';

export const test = async (req, res, next) => {
  try {
    return res.status(200).json({
      message: 'success'
    });
  } catch (e) {
    return next(e);
  }
};
