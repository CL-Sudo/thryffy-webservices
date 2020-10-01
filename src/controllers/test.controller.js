import { normaliseBrand } from '@utils/product.utils';
import S3 from '@configs/s3.config';

export const test = async (req, res, next) => {
  try {
    console.log(S3.PROFILE_PHOTO_DIR);
    console.log(S3.GALLERY_URL);
    return res.status(200).json({
      message: 'success',
      payload: normaliseBrand(req.query.key)
    });
  } catch (e) {
    return next(e);
  }
};
