import formidable from 'formidable';
import S3 from '@configs/s3.config';
import { uploadFileToS3 } from '@tools/s3';
import { Banners } from '@models';
import { parsePathForDBStoring } from '@utils/s3.util';

export const create = async (req, res, next) => {
  const form = formidable({ multiple: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return next(err);
    try {
      if (Object.prototype.hasOwnProperty.call(files, 'banner')) {
        const uploaded = await uploadFileToS3(files.banner, S3.BANNER_URL);
        const payload = await Banners.create({
          countryId: req.user.countryId,
          path: parsePathForDBStoring(uploaded.path)
        });
        return res.status(200).json({
          message: 'success',
          payload
        });
      }

      throw new Error('banner cannot be null');
    } catch (e) {
      return next(e);
    }
  });
};
