import formidable from 'formidable';
import { createValidator } from '@validators/dispute.validator';
import { Disputes, DisputesImages, SalesOrders } from '@models';
import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';
import { uploadFileToS3 } from '@tools/s3';
import { parsePathForDBStoring } from '@utils/s3.util';
import S3 from '@configs/s3.config';
import { DELIVERY_STATUS } from '@constants';
import { disputeListener } from '@listeners/dispute.listener';

export const create = async (req, res, next) => {
  const { orderId } = req.params;
  const form = formidable({ multiple: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return next(err);
    try {
      await createValidator(fields, files);

      const order = await SalesOrders.findOne({ where: { id: orderId } });
      if (order.deliveryStatus !== DELIVERY_STATUS.SHIPPED)
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

      disputeListener.emit('DISPUTE CREATED', order.dataValues);

      return res.status(200).json({
        message: 'success',
        payload
      });
    } catch (e) {
      return next(e);
    }
  });
};
