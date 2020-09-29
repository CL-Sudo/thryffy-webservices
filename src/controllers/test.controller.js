import { normaliseBrand } from '@utils/product.utils';

export const test = async (req, res, next) => {
  try {
    return res.status(200).json({
      message: 'success',
      payload: normaliseBrand(req.query.key)
    });
  } catch (e) {
    return next(e);
  }
};
