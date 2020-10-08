import { getOneProductShippingFee } from '@services/product.service';

export const test = async (req, res, next) => {
  try {
    const fee = await getOneProductShippingFee(req.query.categoryId, req.query.sizeId);
    return res.status(200).json({
      message: 'success',
      payload: fee
    });
  } catch (e) {
    return next(e);
  }
};
