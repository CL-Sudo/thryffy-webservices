import R from 'ramda';
import S3 from '@configs/s3.config';
import { uploadFileToS3 } from '@tools/s3';
import { Galleries, Products, Brands } from '@models';
import { parseImageWithIndex } from '@utils';
import { normaliseBrand } from '@utils/product.utils';
import { Op } from 'sequelize';
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

/**
 *
 * @param {Number} productId
 * @param {Number} index
 */
export const setThumbnail = (productId, index) =>
  new Promise(async (resolve, reject) => {
    try {
      const image = await Galleries.findOne({
        where: {
          index,
          productId
        }
      });
      await Products.update({ thumbnail: image.filePath }, { where: { id: productId } });
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });

/**
 *
 * @param {String} brand
 */
export const getProductBrandId = async brand =>
  new Promise(async (resolve, reject) => {
    try {
      const normalisedBrand = normaliseBrand(brand);
      const existingBrand = await Brands.findOne({
        where: {
          title: {
            [Op.like]: `%${normalisedBrand}%`
          }
        }
      });

      if (!existingBrand) {
        const newBrand = await Brands.create({ title: normalisedBrand });
        return resolve(newBrand.id);
      }

      return resolve(existingBrand.id);
    } catch (e) {
      return reject(e);
    }
  });
