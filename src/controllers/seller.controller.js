import R from 'ramda';
import formidable from 'formidable';
import { getShippingFee, saveProductImages, setThumbnail, getProductBrandId } from '@services';
import { isJSON } from '@utils';
import { Products, ProductColors, SalesOrders, Categories, Sizes } from '@models';
import { SequelizeConnector as Sequelize } from '@configs/sequelize-connector.config';
import { addProductValidator } from '@validators/seller.validator';
import { requestValidator } from '@validators/index';
import { DELIVERY_STATUS } from '@constants';

export const addProduct = async (req, res, next) => {
  const transaction = await Sequelize.transaction();
  const form = formidable({ multiple: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return next(err);
    try {
      await addProductValidator(fields);
      const { id } = req.user;

      const colors = R.ifElse(isJSON, param => JSON.parse(param), R.identity)(fields.colors);

      const saveProduct = async (userId, formFields, images) => {
        try {
          const {
            title,
            description,
            brand,
            categoryId,
            size,
            condition,
            price,
            thumbnailIndex
          } = formFields;

          const brandId = await getProductBrandId(brand);

          const product = await Products.create(
            {
              userId,
              categoryId,
              title,
              description,
              price,
              condition,
              size,
              brandId
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

      const payload = await R.pipeP(saveProduct, saveColors, getProduct)(id, fields, files);

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
    const { categoryId, size } = req.query;
    const shippingFee = await getShippingFee(categoryId, size);
    return res.status(200).json({
      message: 'success',
      payload: {
        shippingFee
      }
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
