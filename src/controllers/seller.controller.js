import R from 'ramda';
import formidable from 'formidable';
import {
  saveProductImages,
  setThumbnail,
  getProductBrandId,
  updateProductImages,
  getOneProductShippingFee
} from '@services';
import { isJSON } from '@utils';
import { Products, ProductColors, SalesOrders, Sizes, Users } from '@models';
import { SequelizeConnector as Sequelize } from '@configs/sequelize-connector.config';
import { addProductValidator } from '@validators/seller.validator';
import { updateProductValidator } from '@validators/Admin/products.validator';
import { requestValidator } from '@validators/index';
import { DELIVERY_STATUS, USER_TYPE } from '@constants';

export const addProduct = async (req, res, next) => {
  const transaction = await Sequelize.transaction();
  const form = formidable({ multiple: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return next(err);
    try {
      await addProductValidator(fields);
      const { id, type } = req.user;
      const isAdmin = type === USER_TYPE.ADMIN;

      const {
        sellerId,
        title,
        description,
        brand,
        categoryId,
        sizeId,
        condition,
        price,
        thumbnailIndex
      } = fields;

      if (sellerId) {
        const seller = await Users.findOne({ where: { id: sellerId } });
        if (!seller) throw new Error('Invalid sellerId given');
      }

      const colors = R.ifElse(isJSON, param => JSON.parse(param), R.identity)(fields.colors);

      const saveProduct = async images => {
        try {
          const size = await Sizes.findOne({ where: { id: sizeId } });
          if (!size) throw new Error('Invalid sizeId given');

          const brandId = await getProductBrandId(brand);

          const product = await Products.create(
            {
              userId: isAdmin ? sellerId : id,
              categoryId,
              title,
              description,
              price,
              condition,
              sizeId,
              brandId,
              createdBy: isAdmin ? id : null
            },
            transaction
          );

          await saveProductImages(product.id, images);
          await setThumbnail(product.id, thumbnailIndex);
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
    requestValidator(req);

    const { deliveryTrackingNo } = req.body;

    const order = await SalesOrders.findOne({
      where: { deliveryTrackingNo }
    });

    await order.update({ deliveryStatus: DELIVERY_STATUS.SHIPPED });

    const payload = await SalesOrders.scope({ method: ['orderDetails', order.id] }).findOne();

    return res.status(200).json({
      message: 'success',
      payload
    });
  } catch (e) {
    return next(e);
  }
};

export const updateProduct = async (req, res, next) => {
  const form = formidable({ multiple: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return next(err);
    try {
      await updateProductValidator(addProductValidator)(fields, files);

      const { id, type } = req.user;
      const { id: productId } = req.params;
      const isAdmin = type === USER_TYPE.ADMIN;

      const existingProduct = await Products.findOne({ where: { id: productId } });
      if (!existingProduct) throw new Error('Invalid productId given.');

      const imagesToPersist = R.ifElse(
        isJSON,
        param => JSON.parse(param),
        R.identity
      )(fields.imagesToPersist);

      const {
        title,
        description,
        brand,
        categoryId,
        sizeId,
        condition,
        price,
        thumbnailIndex
      } = fields;

      const colors = R.ifElse(isJSON, param => JSON.parse(param), R.identity)(fields.colors);

      const brandId = await getProductBrandId(brand);

      const updateProductAndImages = async () => {
        try {
          const product = await Products.findOne({ where: { id: productId } });
          await product.update(
            {
              title,
              description,
              brandId,
              categoryId,
              sizeId,
              condition,
              price,
              thumbnailIndex,
              updatedBy: isAdmin ? id : product.userId
            },
            { where: { id: productId } }
          );
          await updateProductImages(productId, imagesToPersist);
          await saveProductImages(product.id, files);
          await setThumbnail(productId, thumbnailIndex);
          return Promise.resolve();
        } catch (e) {
          return Promise.reject(e);
        }
      };

      const updateColors = async () => {
        try {
          await ProductColors.destroy({ where: { productId }, force: true });
          const arr = colors.map(color => ({
            productId,
            color
          }));
          await ProductColors.bulkCreate(arr);
          return Promise.resolve();
        } catch (e) {
          return Promise.reject(e);
        }
      };

      await R.pipeP(updateProductAndImages, updateColors)();

      const payload = await Products.scope({ method: ['productPage', productId] }).findOne();
      return res.status(200).json({ message: 'success', payload });
    } catch (e) {
      return next(e);
    }
  });
};
