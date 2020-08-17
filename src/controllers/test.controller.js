import R from 'ramda';
import testEmitter from '../listeners/test.listener';

export const test = async (req, res, next) => {
  try {
    testEmitter.emit('eventA');
    testEmitter.emit('eventB', { data: 'data' });

    return res.status(200).json({
      message: 'success'
    });
  } catch (e) {
    return next(e);
  }
};
