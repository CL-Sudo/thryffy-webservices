import { isEmpty } from '@validators';
import { Disputes, SalesOrders } from '@models';

export const createValidator = (fields, files) =>
  new Promise(async (resolve, reject) => {
    try {
      if (isEmpty(fields.title)) throw new Error('title is required');
      if (fields.description.length > 250)
        throw new Error('description cannot be more than 250 characters');
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });

export const respondValidator = (req, fields, files) =>
  new Promise(async (resolve, reject) => {
    try {
      const { response } = fields;
      const { id } = req.user;
      const { disputeId } = req.params;
      if (isEmpty(response)) throw new Error('response required');

      if (response.trim().length > 250)
        throw new Error('response cannot be more than 250 characters');

      const dispute = await Disputes.findOne({
        where: { id: disputeId },
        include: [
          {
            model: SalesOrders,
            as: 'order'
          }
        ]
      });

      if (!dispute) throw new Error('Invalid disputeId given');

      if (dispute.order.hasSellerDispute) {
        throw new Error('You have already responded this dispute');
      }

      if (dispute.order.sellerId !== id) {
        throw new Error('You are not the seller of this order');
      }

      return resolve();
    } catch (e) {
      return reject(e);
    }
  });
