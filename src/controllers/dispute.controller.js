import formidable from 'formidable';
import { createValidator, respondValidator } from '@validators/dispute.validator';
import {
  Disputes,
  DisputesImages,
  SalesOrders,
  DisputeResponses,
  ResponseImages,
  Users
} from '@models';
import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';
import { uploadFileToS3 } from '@tools/s3';
import { parsePathForDBStoring } from '@utils/s3.util';
import S3 from '@configs/s3.config';
import { disputeListener } from '@listeners/dispute.listener';

import { DELIVERY_STATUS } from '@constants';
import { defaultExcludeFields } from '@constants/sequelize.constant';
import LISTENER from '@constants/listener.constant';

export const create = async (req, res, next) => {
  const form = formidable({ multiple: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return next(err);
    try {
      await createValidator(fields, files);
      const { orderId } = fields;

      const order = await SalesOrders.findOne({ where: { id: orderId } });
      if (
        order.deliveryStatus !== DELIVERY_STATUS.DELIVERED &&
        order.deliveryStatus !== DELIVERY_STATUS.SHIPPED
      )
        throw new Error('You are not allowed to dispute this item.');

      const disputeId = await sequelize.transaction(async transaction => {
        const dispute = await Disputes.create({ ...fields, orderId }, { transaction });

        const paths = await Promise.all(
          Object.keys(files).map(async key => {
            const uploaded = await uploadFileToS3(files[key], S3.DISPUTE_URL);

            return uploaded.path;
          })
        );

        const imageArr = paths.map(path => ({
          disputeId: dispute.id,
          path: parsePathForDBStoring(path)
        }));

        if (imageArr.length > 0) {
          await DisputesImages.bulkCreate(imageArr, { transaction });
        }

        await order.update({ hasBuyerDispute: true }, { transaction });

        return dispute.id;
      });

      const payload = await Disputes.findOne({
        where: { id: disputeId },
        include: [
          {
            model: DisputesImages,
            as: 'images'
          }
        ]
      });

      disputeListener.emit(LISTENER.DISPUTE.CREATED, order.dataValues, payload);

      return res.status(200).json({
        message: 'success',
        payload
      });
    } catch (e) {
      return next(e);
    }
  });
};

export const respond = async (req, res, next) => {
  const form = formidable({ multiple: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return next(err);
    try {
      await respondValidator(req, fields, files);
      const { disputeId } = fields;

      const responseId = await sequelize.transaction(async transaction => {
        const dispute = await Disputes.findOne({
          where: { id: disputeId },
          include: [
            {
              model: SalesOrders,
              as: 'order'
            }
          ]
        });
        await dispute.order.update({ hasSellerDispute: true }, { transaction });

        const disputeResponse = await DisputeResponses.create(
          { disputeId, ...fields },
          { transaction }
        );

        const paths = await Promise.all(
          Object.keys(files).map(async key => {
            const uploaded = await uploadFileToS3(files[key], S3.DISPUTE_RESPONSE_URL);

            return uploaded.path;
          })
        );

        const imageArr = paths.map(path => ({
          responseId: disputeResponse.id,
          path: parsePathForDBStoring(path)
        }));

        if (imageArr.length > 0) {
          await ResponseImages.bulkCreate(imageArr, { transaction });
        }

        return disputeResponse.id;
      });

      const payload = await DisputeResponses.findOne({
        where: { id: responseId },
        include: [
          {
            model: ResponseImages,
            as: 'images'
          },
          {
            model: Disputes,
            as: 'dispute'
          }
        ]
      });

      disputeListener.emit(LISTENER.DISPUTE.RESPONSE_CREATED, payload);

      return res.status(200).json({
        message: 'success',
        payload
      });
    } catch (e) {
      return next(e);
    }
  });
};

export const getDispute = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await SalesOrders.findOne({
      where: { id: orderId },
      include: [
        {
          model: Users,
          as: 'buyer',
          attributes: { exclude: [...defaultExcludeFields] }
        }
      ]
    });

    const dispute = await Disputes.findOne({
      where: { orderId },
      include: [{ model: DisputesImages, as: 'images' }]
    });
    if (!dispute) throw new Error('Invalid orderId given');
    return res.status(200).json({
      message: 'success',
      payload: { ...dispute.dataValues, buyer: order.dataValues.buyer }
    });
  } catch (e) {
    return next(e);
  }
};
