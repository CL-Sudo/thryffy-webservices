import R from 'ramda';
import * as _ from 'lodash';
import S3 from '@configs/s3.config';
import { uploadFileToS3, deleteObjectFromS3 } from '@tools/s3';
import { Galleries, Products, Brands, Categories, ShippingFees, Sizes } from '@models';
import { parseImageWithIndex } from '@utils';
import { normaliseBrand } from '@utils/product.utils';
import { Op } from 'sequelize';
import Parcel from '@constants/parcel_types.constant';
import { defaultExcludeFields } from '@constants/sequelize.constant';
import SHIPPING from '@constants/shipping.constant';
import CATEGORY from '@constants/category.constant';
import { COUNTRIES } from '@constants/countries.constant';

/**
 *
 * @param {Array} productIds
 * @return {Number} Shipping Fee
 */
export const getShippingFee = async productIds =>
  new Promise(async (resolve, reject) => {
    try {
      const product1 = await Products.findOne({
        include: ['country'],
        where: { id: productIds[0] }
      });

      if (product1.country.code === COUNTRIES.BRUNEI.CODE) {
        const bruneiShippingFee = await ShippingFees.findOne({
          where: { countryId: product1.country.id }
        });

        return resolve(bruneiShippingFee.get());
      }

      if (productIds.length === 2) {
        const shippingFee = await ShippingFees.scope([
          { method: ['byCountry', product1.countryId] }
        ]).findOne({
          where: { type: Parcel.TWO_ITEM_LARGE_PARCEL }
        });
        return resolve(shippingFee.dataValues);
      }

      if (productIds.length > 2) {
        const shippingFee = await ShippingFees.scope([
          { method: ['byCountry', product1.countryId] }
        ]).findOne({
          where: { type: Parcel.THREE_ITEM_LARGE_PARCEL }
        });
        return resolve(shippingFee.dataValues);
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
        if (Number(product.size.uk) > SHIPPING.MAX_SHOES_SIZE_FOR_MEDIUM_PARCEL) {
          const shippingFee = await ShippingFees.scope([
            { method: ['byCountry', product.countryId] }
          ]).findOne({ where: { type: Parcel.LARGE_PARCEL } });
          return resolve(shippingFee.dataValues);
        }
        const shippingFee = await ShippingFees.scope([
          { method: ['byCountry', product1.countryId] }
        ]).findOne({ where: { type: Parcel.MEDIUM_PARCEL } });
        return resolve(shippingFee.dataValues);
      }

      if (product.category.title === CATEGORY.SHOES && root.title === CATEGORY.KIDS) {
        const shippingFee = await ShippingFees.scope([
          { method: ['byCountry', product1.countryId] }
        ]).findOne({ where: { type: Parcel.MEDIUM_PARCEL } });
        return resolve(shippingFee.dataValues);
      }

      return resolve(product.category.shippingFee.dataValues);
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

      await Promise.all(
        R.map(async instance => {
          await upload(instance);
        })(parseImageWithIndex(images))
      );
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
          await deleteObjectFromS3(_.get(image, 'filePath', null));
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
        await Galleries.findAll({ attributes: ['id'], where: { productId } })
      );

      const idsToPersist = R.map(R.prop('id'))(imagesToPersist);

      if (imagesToPersist.length === 0) {
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
      await product.update({ thumbnail: _.get(image, 'filePath', null) });
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });

/**
 *
 * @param {String} brand
 */
export const getProductBrandId = async (brand, countryId) =>
  new Promise(async (resolve, reject) => {
    try {
      const normalisedBrand = normaliseBrand(brand);
      const existingBrand = await Brands.scope({ method: ['byCountry', countryId] }).findOne({
        where: {
          title: {
            [Op.like]: `%${normalisedBrand}%`
          }
        }
      });

      if (!existingBrand) {
        const newBrand = await Brands.create({ title: normalisedBrand, countryId });
        return resolve(newBrand.id);
      }

      return resolve(existingBrand.id);
    } catch (e) {
      return reject(e);
    }
  });

/**
 *
 * @param {Number} categoryId
 * @param {Number} sizeId
 * @returns {Object}
 */
export const getOneProductShippingFee = (categoryId, sizeId) =>
  new Promise(async (resolve, reject) => {
    try {
      const category = await Categories.findOne({
        where: { id: categoryId },
        include: ['shippingFee', 'country']
      });

      if (category.country.code === COUNTRIES.BRUNEI.CODE) {
        const bruneiShippingFee = await ShippingFees.findOne({
          where: { countryId: category.country.id }
        });
        return resolve(bruneiShippingFee.get());
      }

      if (category.title !== CATEGORY.SHOES) {
        return resolve(category.shippingFee);
      }

      const size = await Sizes.findOne({ where: { id: sizeId } });

      if (size.uk > SHIPPING.MAX_SHOES_SIZE_FOR_MEDIUM_PARCEL) {
        const largeParcelShippingFee = await ShippingFees.scope([
          { method: ['byCountry', category.countryId] }
        ]).findOne({
          where: { type: Parcel.LARGE_PARCEL }
        });

        return resolve(largeParcelShippingFee.dataValues);
      }

      const mediumParcelShippingFee = await ShippingFees.scope([
        { method: ['byCountry', category.countryId] }
      ]).findOne({
        where: { type: Parcel.MEDIUM_PARCEL }
      });

      return resolve(mediumParcelShippingFee.dataValues);
    } catch (e) {
      return reject(e);
    }
  });

export const getProductCommission = data => price => {
  if (price <= 0) return 0;

  const maxPriceLens = R.lens(R.prop('maxPrice'), R.assoc('maxPrice'));

  const setMaxToInfinityIfNull = R.ifElse(
    R.propEq('maxPrice', null),
    R.set(maxPriceLens, Infinity),
    R.identity
  );

  const isWithinRange = d => d.maxPrice >= price && d.minPrice <= price;
  const getCommissionPrice = d => R.prop('commissionPrice')(d);
  const multiplyByRate = d => R.multiply(price, R.prop('commissionRate', d));

  const commission = R.pipe(
    R.map(setMaxToInfinityIfNull),
    R.filter(isWithinRange),
    d => d[0],
    R.ifElse(d => R.isNil(R.prop('commissionRate', d)), getCommissionPrice, multiplyByRate),
    d => Number(_.round(d, 2))
  )(data);

  return commission;
};
