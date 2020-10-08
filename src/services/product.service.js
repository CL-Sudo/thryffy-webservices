import R from 'ramda';
import S3 from '@configs/s3.config';
import { uploadFileToS3, deleteObjectFromS3 } from '@tools/s3';
import { Galleries, Products, Brands, Categories, ShippingFees, Sizes } from '@models';
import { parseImageWithIndex } from '@utils';
import { normaliseBrand } from '@utils/product.utils';
import { Op } from 'sequelize';
import Parcel from '@constants/parcel_types.constant';
import { defaultExcludeFields } from '@constants/sequelize.constant';
import { parsePathForDeleting } from '@utils/s3.util';
import SHIPPING from '@constants/shipping.constant';
import CATEGORY from '@constants/category.constant';

/**
 *
 * @param {Array} productIds
 * @return {Number} Shipping Fee
 */
export const getShippingFee = async productIds =>
  new Promise(async (resolve, reject) => {
    try {
      if (productIds.length === 2) {
        return resolve(7.0);
      }

      if (productIds.length > 2) {
        return resolve(4.0);
      }

      const product = await Products.findOne({
        where: { id: productIds[0] },
        include: [
          {
            model: Sizes,
            as: 'size',
            attributes: { exclude: defaultExcludeFields }
          },
          {
            model: Categories,
            as: 'category',
            include: [
              {
                model: ShippingFees,
                as: 'shippingFee'
              }
            ]
          }
        ]
      });

      const root = await product.category.getRoot();

      if (product.category.title === CATEGORY.SHOES && root.title !== CATEGORY.KIDS) {
        if (Number(product.size.uk) > 9) {
          const shippingFee = await ShippingFees.findOne({ where: { type: Parcel.LARGE_PARCEL } });
          return resolve(shippingFee.price);
        }
        const shippingFee = await ShippingFees.findOne({ where: { type: Parcel.MEDIUM_PARCEL } });
        return resolve(shippingFee.price);
      }

      if (product.category.title === CATEGORY.SHOES && root.title === CATEGORY.KIDS) {
        const shippingFee = await ShippingFees.findOne({ where: { type: Parcel.MEDIUM_PARCEL } });
        return resolve(shippingFee.price);
      }

      return resolve(product.category.shippingFee.price);
    } catch (e) {
      return reject(e);
    }
  });

/**
 *
 * @param {File} images
 * @param {Number} productId
 */
export const saveProductImages = async (productId, images = {}) =>
  new Promise(async (resolve, reject) => {
    try {
      if (R.isEmpty(images)) return resolve();

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

export const deleteProductImages = async imageIds =>
  new Promise(async (resolve, reject) => {
    try {
      await Promise.all(
        imageIds.map(async id => {
          const image = await Galleries.findOne({ where: { id } });
          await deleteObjectFromS3(parsePathForDeleting(image.filePath));
          await image.destroy({ force: true });
        })
      );
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });

export const updateProductImages = (productId, imagesToPersist) =>
  new Promise(async (resolve, reject) => {
    try {
      const ids = R.map(R.prop('id'))(
        await Galleries.findAll({ raw: true, attributes: ['id'], where: { productId } })
      );

      const idsToPersist = R.map(R.prop('id'))(imagesToPersist);

      if (!imagesToPersist || imagesToPersist.length === 0) {
        await deleteProductImages(ids);
        return resolve();
      }

      await Promise.all(
        imagesToPersist.map(async obj => {
          await Galleries.update({ index: obj.index }, { where: { id: obj.id } });
        })
      );

      const idsToDelete = R.without(idsToPersist, ids);

      await deleteProductImages(idsToDelete);

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
      const product = await Products.findOne({ where: { id: productId } });
      await product.update({ thumbnail: image.filePath });
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

export const getOneProductShippingFee = (categoryId, sizeId) =>
  new Promise(async (resolve, reject) => {
    try {
      const category = await Categories.findOne({
        where: { id: categoryId },
        include: [
          {
            attributes: ['price', 'markupPrice'],
            model: ShippingFees,
            as: 'shippingFee'
          }
        ]
      });

      if (category.title !== CATEGORY.SHOES) {
        return resolve({
          shippingFee: category.shippingFee.price,
          markupPrice: category.shippingFee.markupPrice
        });
      }

      const size = await Sizes.findOne({ where: { id: sizeId } });

      if (size.uk > SHIPPING.MAX_SHOES_SIZE_FOR_MEDIUM_PARCEL) {
        const largeParcelShippingFee = await ShippingFees.findOne({
          attributes: ['price', 'markupPrice'],
          where: { type: Parcel.LARGE_PARCEL }
        });

        return resolve({
          shippingFee: largeParcelShippingFee.price,
          markupPrice: largeParcelShippingFee.markupPrice
        });
      }

      const mediumParcelShippingFee = await ShippingFees.findOne({
        attributes: ['price', 'markupPrice'],
        where: { type: Parcel.MEDIUM_PARCEL }
      });

      return resolve({
        shippingFee: mediumParcelShippingFee.price,
        markupPrice: mediumParcelShippingFee.markupPrice
      });
    } catch (e) {
      return reject(e);
    }
  });
