import * as R from 'ramda';
import _ from 'lodash';
import formidable from 'formidable';
import {
  saveProductImages,
  setThumbnail,
  getProductBrandId,
  updateProductImages,
  getOneProductShippingFee,
  getChildIds,
  getProductCommission as calculateProductCommission
} from '@services';
import { isJSON, paginate, listDiff, parseImageWithIndex, getCountryId } from '@utils';
import {
  Products,
  ProductColors,
  SalesOrders,
  Sizes,
  Users,
  Subscriptions,
  Reviews,
  Galleries,
  Conditions,
  Brands,
  Categories,
  DeliverySlips,
  Commissions,
  CommissionFreeCampaigns
} from '@models';
import { SequelizeConnector as Sequelize } from '@configs/sequelize-connector.config';

import { addProductValidator, markAsShippedValidator } from '@validators/seller.validator';
import { updateProductValidator } from '@validators/Admin/products.validator';

import { requestValidator } from '@validators/index';
import { DELIVERY_STATUS, USER_TYPE } from '@constants';
import { postTrackingNumber } from '@services/trackingmore.service';
import { sellerListener } from '@listeners/seller.listener';
import { defaultExcludeFields } from '@constants/sequelize.constant';
import { Op } from 'sequelize';
import { uploadFileToS3 } from '@tools/s3';
import S3_CONFIG from '@configs/s3.config';
import { uploadFiles } from '@tools/multer.tool';

const { AWS_S3_URL } = process.env;

const parseImagesToPersist = fields => {
  const parseFromJSON = arr => R.map(R.ifElse(isJSON, param => JSON.parse(param), R.identity))(arr);

  const result = R.pipe(
    R.without([1]),
    parseFromJSON
  )(
    Object.keys(fields).map(key => {
      if (isJSON(fields[key]) && key.substr(0, 5) === 'image') {
        const indexString = `, "index": ${key.substr(6, 1)}}`;
        return fields[key].replace('}', indexString);
      }
      if (!isJSON(fields[key]) && key.substr(0, 5) === 'image') {
        return { id: fields[key].id, index: Number(key.substr(6, 1)) };
      }
      return 1;
    })
  );
  return result;
};

const checkIsAbleToPublishProduct = async userId => {
  try {
    const productCount = await Products.scope('countedInListing').count({ where: { userId } });

    const user = await Users.findOne({ where: { id: userId } });

    return Promise.resolve(productCount < user.maxListing);
  } catch (e) {
    return Promise.reject(e);
  }
};

export const addProduct = async (req, res, next) => {
  const countryId = await getCountryId(req);
  const transaction = await Sequelize.transaction();
  const form = formidable({ multiple: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return next(err);
    try {
      await addProductValidator(req, fields);
      const { id, type } = req.user;
      const isAdmin = type === USER_TYPE.ADMIN;

      const {
        sellerId,
        title,
        description,
        brand,
        categoryId,
        sizeId,
        conditionId,
        price: originalPrice,
        thumbnailIndex
      } = fields;

      if (sellerId) {
        const seller = await Users.findOne({ where: { id: sellerId } });
        if (!seller) throw new Error('Invalid sellerId given');
      }

      const colors = R.ifElse(isJSON, param => JSON.parse(param), R.identity)(fields.colors);

      const saveProduct = async images => {
        try {
          if (sizeId) {
            const size = await Sizes.findOne({ where: { id: sizeId } });
            if (!size) throw new Error('Invalid sizeId given');
          }

          const brandId = await getProductBrandId(brand);

          const extraCharges = await getOneProductShippingFee(categoryId, sizeId);

          const product = await Products.create(
            {
              countryId,
              userId: isAdmin ? sellerId : id,
              categoryId,
              title,
              description,
              originalPrice,
              conditionId,
              sizeId,
              brandId,
              markupPrice: extraCharges.markupPrice,
              createdBy: isAdmin ? id : null
            },
            transaction
          );

          // await saveProductImages(product.id, images);

          await Promise.all(
            parseImageWithIndex(images).map(async instance => {
              const uploaded = await uploadFileToS3(instance.image, S3_CONFIG.GALLERY_URL);
              const filePath = `${AWS_S3_URL}/${uploaded.path}`;

              await Galleries.create(
                {
                  index: instance.index,
                  productId: product.id,
                  filePath
                },
                { transaction }
              );
            })
          );

          const image = await Galleries.findOne({
            where: {
              index: thumbnailIndex,
              productId: product.id
            },
            transaction
          });
          await product.update({ thumbnail: _.get(image, 'filePath', null) }, { transaction });

          // await setThumbnail(product.id, thumbnailIndex);

          return Promise.resolve(product.id);
        } catch (e) {
          return Promise.reject(e);
        }
      };

      const saveColors = async productId => {
        try {
          const createObject = colors.map(color => ({
            productId,
            color
          }));

          await ProductColors.bulkCreate(createObject, { transaction });
          await transaction.commit();
          return Promise.resolve(productId);
        } catch (e) {
          return Promise.reject(e);
        }
      };

      const getProduct = async productId => {
        try {
          const product = await Products.scope({ method: ['productPage', productId] }).findOne();
          return Promise.resolve(product);
        } catch (e) {
          return Promise.reject(e);
        }
      };

      const payload = await R.pipeP(saveProduct, saveColors, getProduct)(files);

      return res.status(200).json({
        message: 'success',
        payload
      });
    } catch (e) {
      await transaction.rollback();
      return next(e);
    }
  });
};

export const getProductShippingFee = async (req, res, next) => {
  try {
    requestValidator(req);

    const { categoryId, sizeId } = req.query;

    const shippingFee = await getOneProductShippingFee(categoryId, sizeId);
    return res.status(200).json({
      message: 'success',
      payload: shippingFee
    });
  } catch (e) {
    return next(e);
  }
};

export const markAsShipped = async (req, res, next) => {
  try {
    await markAsShippedValidator(req);

    const { orderId, deliveryTrackingNo } = req.body;

    await Sequelize.transaction(async transaction => {
      const order = await SalesOrders.findOne({
        where: { id: orderId },
        transaction
      });

      if (!_.isEmpty(req.files)) {
        const uploaded = await uploadFiles(req.files, ['deliverySlip']);

        const createDeliverySlipArr = uploaded.deliverySlip.map(instance => ({
          orderId: order.id,
          path: instance.path
        }));

        await DeliverySlips.bulkCreate(createDeliverySlipArr, { transaction });
      }

      await order.update(
        {
          deliveryStatus: DELIVERY_STATUS.SHIPPED,
          deliveryTrackingNo,
          shippedAt: new Date()
        },
        { transaction }
      );

      await postTrackingNumber(deliveryTrackingNo);
    });

    const payload = await SalesOrders.scope({ method: ['orderDetails', orderId] }).findOne();
    await payload.getExtraFields();

    sellerListener.emit('MARKED AS SHIPPED', payload);

    return res.status(200).json({
      message: 'success',
      payload
    });
  } catch (e) {
    return next(e);
  }
};

export const updateProduct = async (req, res, next) => {
  const countryId = await getCountryId(req);
  const form = formidable({ multiple: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return next(err);
    try {
      await updateProductValidator(addProductValidator)(req, fields, files);

      const { id, type } = req.user;
      const { productId } = req.params;
      const isAdmin = type === USER_TYPE.ADMIN;

      const existingProduct = await Products.scope([{ method: ['byProduct', countryId] }]).findOne({
        where: { id: productId }
      });
      if (!existingProduct) throw new Error('Invalid productId given.');

      // const imagesToPersist = R.ifElse(
      //   isJSON,
      //   param => JSON.parse(param),
      //   R.identity
      // )(fields.imagesToPersist);

      const {
        title,
        description,
        brand,
        categoryId,
        sizeId,
        conditionId,
        price: originalPrice,
        thumbnailIndex = 0
      } = fields;

      const extraCharges = await getOneProductShippingFee(categoryId, sizeId);

      const colors = R.ifElse(isJSON, param => JSON.parse(param), R.identity)(fields.colors);

      const existingColors = R.map(R.prop('color'))(
        await ProductColors.findAll({ where: { productId } })
      );

      const { additionalItems: colorsToBeAdded, removedItems: colorsToBeRemoved } = listDiff(
        existingColors,
        colors
      );

      const brandId = await getProductBrandId(brand);

      await Sequelize.transaction(async transaction => {
        if (colorsToBeAdded.length > 0) {
          const data = colorsToBeAdded.map(color => ({
            productId,
            color
          }));
          await ProductColors.bulkCreate(data, transaction);
        }

        if (colorsToBeRemoved.length > 0) {
          await ProductColors.destroy({
            where: { productId, color: colorsToBeRemoved },
            force: true,
            transaction
          });
        }

        const product = await Products.findOne({ where: { id: productId } });
        await product.update({
          title,
          description,
          brandId,
          categoryId,
          sizeId,
          conditionId,
          originalPrice,
          markupPrice: extraCharges.markupPrice,
          updatedBy: isAdmin ? id : product.userId
        });

        await updateProductImages(productId, parseImagesToPersist(fields));
        await saveProductImages(product.id, files);
        await setThumbnail(productId, thumbnailIndex);
      });

      // const updateProductAndImages = async () => {
      //   try {
      //     const product = await Products.findOne({ where: { id: productId } });
      //     await product.update(
      //       {
      //         title,
      //         description,
      //         brandId,
      //         categoryId,
      //         sizeId,
      //         conditionId,
      //         originalPrice,
      //         markupPrice: extraCharges.markupPrice,
      //         thumbnailIndex,
      //         updatedBy: isAdmin ? id : product.userId
      //       },
      //       { where: { id: productId } }
      //     );
      //     await updateProductImages(productId, imagesToPersist);
      //     await saveProductImages(product.id, files);
      //     await setThumbnail(productId, thumbnailIndex);
      //     return Promise.resolve();
      //   } catch (e) {
      //     return Promise.reject(e);
      //   }
      // };

      // const updateColors = async () => {
      //   try {
      //     await ProductColors.destroy({ where: { productId }, force: true });
      //     const arr = colors.map(color => ({
      //       productId,
      //       color
      //     }));
      //     await ProductColors.bulkCreate(arr);
      //     return Promise.resolve();
      //   } catch (e) {
      //     return Promise.reject(e);
      //   }
      // };

      // await R.pipeP(updateProductAndImages, updateColors)();

      const payload = await Products.scope({ method: ['productPage', productId] }).findOne();
      return res.status(200).json({ message: 'success', payload });
    } catch (e) {
      return next(e);
    }
  });
};

export const getProducts = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const {
      categoryId,
      keyword,
      brandId,
      sizeId,
      conditionId,
      minPrice,
      maxPrice,
      order = 'RELEVANCE',
      limit = 10,
      offset = 0
    } = req.query;

    const countryId = await getCountryId(req);

    const id = _.get(req, 'user.id', null);

    const filterTitle = param => {
      if (R.isNil(keyword)) {
        return param;
      }

      return R.merge({
        [Op.or]: [
          {
            title: {
              [Op.like]: `%${keyword}%`
            }
          },
          // {
          //   brand_id: [
          //     Sequelize.literal(`
          //     SELECT id FROM brands WHERE title LIKE '%${keyword}%'
          //   `)
          //   ]
          // }
          {
            brand_id: [
              Sequelize.literal(`
              SELECT id FROM brands WHERE title LIKE '%${keyword}% AND country_id=${countryId}'
            `)
            ]
          }
        ]
      })(param);
    };

    const where = R.pipe(filterTitle)({
      userId: sellerId,
      isPublished: true,
      isPurchased: false,
      isVerify: true
    });

    const childIds = categoryId ? await getChildIds(categoryId) : null;

    const products = await Products.scope('default').findAll({
      where,
      include: [
        {
          model: Categories,
          as: 'category',
          where: categoryId
            ? {
                id: [categoryId, ...childIds]
              }
            : null
        },
        {
          model: Brands,
          as: 'brand',
          attributes: ['id', 'title'],
          where: brandId ? { id: brandId } : null
        },
        {
          model: Sizes,
          as: 'size',
          attributes: { exclude: defaultExcludeFields },
          where: sizeId ? { id: sizeId } : null
        },
        {
          model: Users,
          as: 'seller',
          include: [{ model: Subscriptions, as: 'subscription' }]
        },
        {
          model: Conditions,
          as: 'condition',
          attributes: { exclude: defaultExcludeFields },
          where: conditionId ? { id: conditionId } : null
        }
      ]
    });

    const filterByPrice = R.ifElse(
      R.always(R.or(R.isNil(maxPrice), R.isNil(minPrice))),
      data => data,
      R.filter(product => product.displayPrice >= minPrice && product.displayPrice <= maxPrice)
    );

    const filterBySellerSubscription = R.ifElse(
      product => !R.isNil(R.path(['seller', 'subscription'], product)),
      R.filter(instance => instance.seller.subscription.expiryDate > new Date()),
      R.identity
    );

    const filteredProducts = R.pipe(
      filterBySellerSubscription,
      R.filter(product => product.isPublished && !product.isPurchased),
      filterByPrice
    )(products);

    const sorter = productArr => {
      if (R.toUpper(order) === 'RELEVANCE') {
        return productArr;
      }

      if (R.toUpper(order) === 'ASC') {
        return R.sortBy(R.prop('displayPrice'))(productArr);
      }

      if (R.toUpper(order) === 'DESC') {
        return R.reverse(R.sortBy(R.prop('displayPrice'))(productArr));
      }

      return _.shuffle(productArr);
    };

    await Promise.all(
      R.map(async product => {
        await product.getExtraFields(id);
      })(filteredProducts)
    );

    const sorted = sorter(filteredProducts);

    return res.status(200).json({
      message: 'success',
      payload: {
        count: filteredProducts.length,
        rows: paginate(limit)(offset)(sorted)
      }
    });
  } catch (e) {
    return next(e);
  }
};

export const getSellerDetail = async (req, res, next) => {
  try {
    const id = _.get(req, 'user.id', null);
    const { sellerId } = req.params;

    const seller = await Users.scope('sellerDetail').findOne({ where: { id: sellerId } });
    await seller.getExtraFields();
    await seller.checkIsFollowed(id);

    return res.status(200).json({ message: 'success', payload: seller });
  } catch (e) {
    return next(e);
  }
};

export const getSellerReviews = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const { limit, offset } = req.query;
    const orders = await SalesOrders.findAll({
      where: { sellerId },
      include: [{ model: Reviews, as: 'review' }]
    });

    const reviews = orders
      .filter(instance => !R.isNil(instance.review))
      .map(instance => instance.review);

    return res.status(200).json({
      message: 'success',
      payload: {
        count: reviews.length,
        rows: paginate(limit)(offset)(reviews)
      }
    });
  } catch (e) {
    return next(e);
  }
};

export const publication = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { productId } = req.params;
    const { isPublished } = req.body;

    const user = await Users.findOne({ where: { id: userId } });

    const product = await Products.findOne({ where: { id: productId } });

    if (!product) {
      throw new Error('Invalid productId given');
    }

    if (product.userId !== userId) {
      throw new Error(`Product ${productId} does not to user ${userId}`);
    }
    if (product.isPublished === isPublished) {
      throw new Error(`This product has already been ${isPublished ? 'published' : 'unpublished'}`);
    }

    if (isPublished) {
      const isAbleToAddProduct = await checkIsAbleToPublishProduct(userId);
      if (!isAbleToAddProduct) {
        throw new Error(
          `You have listed the maximum of ${user.maxListing} item(s). Upgrade your membership to continue.`
        );
      }
    }

    await product.update({ isPublished });

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    return next(e);
  }
};

export const getSellerCategories = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const { sellerId } = req.params;

    const countryId = await getCountryId(req);

    const products = await Products.findAll({
      where: {
        isPurchased: false,
        isPublished: true,
        userId: sellerId
      },
      include: [
        {
          model: Categories,
          as: 'category'
        }
      ]
    });

    const categoryIds = products.map(instance => instance.category.id);

    // const categories = await Categories.findAndCountAll({
    //   where: { id: categoryIds },
    //   limit: Number(limit) || null,
    //   offset: Number(offset) || null
    // });

    const categories = await Categories.scope([
      { method: ['byCountry', countryId] }
    ]).findAndCountAll({
      where: { id: categoryIds },
      limit: Number(limit) || null,
      offset: Number(offset) || null
    });

    return res.status(200).json({ message: 'success', payload: categories });
  } catch (e) {
    return next(e);
  }
};

export const getProductCommission = async (req, res, next) => {
  try {
    const { price } = req.query;

    const countryId = await getCountryId(req);

    const commissions = await Commissions.scope([{ method: ['byCountry', countryId] }]).findAll();

    const freeCommissionCampaign = await CommissionFreeCampaigns.scope([
      'runningCampaign',
      { method: ['byCountry', countryId] }
    ]).findOne();

    const commission = freeCommissionCampaign
      ? 0
      : calculateProductCommission(commissions)(Number(price));

    return res.status(200).json({
      message: 'success',
      payload: {
        commission
      }
    });
  } catch (e) {
    return next(e);
  }
};
