import R from 'ramda';
import formidable from 'formidable';
import { getShippingFee, saveProductImages } from '@services';
import { isJSON } from '@utils';
import { Products, ProductColors } from '@models';
import { SequelizeConnector as Sequelize } from '@configs/sequelize-connector.config';

export const addProduct = async (req, res, next) => {
  const transaction = await Sequelize.transaction();
  const form = formidable({ multiple: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return next(err);
    try {
      const { id } = req.user;

      const colors = R.ifElse(isJSON, param => JSON.parse(param), R.identity)(fields.colors);

      const saveProduct = async (userId, formFields, images) => {
        try {
          const { title, description, brand, categoryId, size, condition, price } = formFields;
          const product = await Products.create(
            {
              userId,
              categoryId,
              title,
              description,
              price,
              condition,
              size,
              brand
            },
            transaction
          );
          await saveProductImages(product.id, images);
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
          return Promise.resolve();
        } catch (e) {
          return Promise.reject(e);
        }
      };

      await R.pipeP(saveProduct, saveColors)(id, fields, files);

      await transaction.commit();
      return res.status(200).json({
        message: 'success',
        payload: {}
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
