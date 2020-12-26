import { Categories } from '@models';
import { asyncMap } from '@utils';

export const test = async (req, res, next) => {
  try {
    const { q } = req.query;

    // const result = await
    return res.status(200).json({
      message: 'not found'
    });
  } catch (e) {
    return next(e);
  }
};
