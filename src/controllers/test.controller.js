import R from 'ramda';
import { isJSON } from '@utils';

import * as Models from '@models';

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

export const test = async (req, res, next) => {
  try {
    const { q } = req.query;

    const order = await Models.SalesOrders.findOne({
      where: { deliveryTrackingNo: 'ETF004545' },
      include: [
        { model: Models.Users, as: 'buyer' },
        {
          model: Models.OrderItems,
          as: 'orderItems',
          include: [{ model: Models.Products, as: 'product' }]
        },
        { model: Models.DeliveryStatuses, as: 'deliveryStatus' }
      ]
    });

    return res.status(200).json({
      message: 'not found',
      payload: order
    });
  } catch (e) {
    console.log('e', e);
    return next(e);
  }
};
