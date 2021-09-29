import { Categories } from '@models';
import formidable from 'formidable';
import { createValidator } from '@validators/categories.validator';
import { uploadThumbnail, updateThumbnail } from '@services/category.service';

export const create = async (req, res, next) => {
  const form = formidable({ multiple: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return next(err);
    try {
      await createValidator(req, fields);
      const category = await Categories.create({
        ...fields,
        createdBy: req.user.id,
        countryId: req.user.countryId
      });

      const hasThumbnailProperty = Object.prototype.hasOwnProperty.call(files, 'thumbnail');
      if (hasThumbnailProperty) {
        await uploadThumbnail(files.thumbnail, category.id);
      }

      await category.reload();

      return res.status(200).json({
        message: 'success',
        payload: category
      });
    } catch (e) {
      return next(e);
    }
  });
};

export const update = async (req, res, next) => {
  const form = formidable({ multiple: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return next(err);
    try {
      const { id } = req.params;

      await createValidator(req, fields);

      const category = await Categories.scope([
        { method: ['byCountry', req.user.countryId] }
      ]).findOne({ where: { id } });

      if (!category) throw new Error('Invalid category id given.');

      await category.update({ ...fields, updatedBy: req.user.id });

      if (Object.prototype.hasOwnProperty.call(files, 'thumbnail')) {
        await updateThumbnail(files.thumbnail, category.id);
      }

      await category.reload();

      return res.status(200).json({
        message: 'success',
        payload: category
      });
    } catch (e) {
      return next(e);
    }
  });
};
