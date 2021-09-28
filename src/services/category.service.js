import { uploadFileToS3, deleteObjectFromS3 } from '@tools/s3';
import { Categories } from '@models';
import S3 from '@configs/s3.config';

/**
 *
 * @param {File} file
 * @param {Number} categoryId
 */
export const uploadThumbnail = (file, categoryId) =>
  new Promise(async (resolve, reject) => {
    try {
      const uploaded = await uploadFileToS3(file, S3.CATEGORY_THUMBNAIL);
      const path = `${S3.AWS_S3_URL}/${uploaded.path}`;
      await Categories.update({ thumbnail: path }, { where: { id: categoryId } });
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });

/**
 *
 * @param {Number} categoryId
 */
export const deleteThumbnail = categoryId =>
  new Promise(async (resolve, reject) => {
    try {
      const category = await Categories.findOne({ where: { id: categoryId } });
      if (category.thumbnail) {
        await deleteObjectFromS3(category.thumbnail);
        category.update({ thumbnail: null });
      }
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });

/**
 *
 * @param {File} file
 * @param {Number} categoryId
 */
export const updateThumbnail = (file, categoryId) =>
  new Promise(async (resolve, reject) => {
    try {
      await deleteThumbnail(categoryId);
      await uploadThumbnail(file, categoryId);
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });
