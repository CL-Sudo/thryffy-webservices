import { Products, Categories } from '@models';
import { getChildIds } from '@services';

export const test = async (req, res, next) => {
  try {
    const { q } = req.body;
    const result = await getChildIds(q);

    console.log('result', result);

    return res.status(200).json({
      message: 'success',
      payload: result
    });
  } catch (e) {
    return next(e);
  }
};
