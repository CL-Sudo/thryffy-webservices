import R from 'ramda';
import { S3 } from '@constants';
import { uploadFileToS3 } from '@tools/s3';
import { Galleries, Products } from '@models';
import { parseImageWithIndex } from '@utils';
/**
 *
 * @param {Number} categoryId
 * @param {String} size
 */
export const getShippingFee = async (categoryId, size) =>
  new Promise(async (resolve, reject) => {
    try {
      //
      return resolve(3.0);
    } catch (e) {
      return reject(e);
    }
  });

/**
 *
 * @param {File} images
 * @param {Number} productId
 */
export const saveProductImages = async (productId, images) =>
  new Promise(async (resolve, reject) => {
    try {
      const { AWS_S3_URL } = process.env;

      const upload = async obj => {
        try {
          const uploaded = await uploadFileToS3(obj.image, S3.GALLERY_URL);
          const filePath = `${AWS_S3_URL}/${uploaded.path}`;

          if (obj.index === 0)
            await Products.update({ thumbnail: filePath }, { where: { id: productId } });

          await Galleries.create({
            index: obj.index,
            productId,
            filePath
          });
          return Promise.resolve();
        } catch (e) {
          return Promise.reject(e);
        }
      };

      await Promise.all(R.map(await upload)(parseImageWithIndex(images)));
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });
