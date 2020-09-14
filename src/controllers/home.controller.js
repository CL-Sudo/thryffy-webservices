import { getSuggestedItems } from '@services';

export const list = async (req, res, next) => {
  try {
    return res.status(200).json({
      message: 'success',
      payload: []
    });
  } catch (e) {
    return next(e);
  }
};
