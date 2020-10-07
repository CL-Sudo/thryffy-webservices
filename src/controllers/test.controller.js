import { getShippingFee } from '@services';

export const test = async (req, res, next) => {
  try {
    const fee = await getShippingFee([1]);
    return res.status(200).json({
      message: 'success',
      payload: fee
    });
  } catch (e) {
    return next(e);
  }
};
