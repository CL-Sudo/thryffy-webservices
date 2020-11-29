import R from 'ramda';
import { Preferences, SalesOrders } from '@models';
export const test = async (req, res, next) => {
  try {
    const result = await Preferences.findAll({});

    const order = await SalesOrders.scope({ method: ['orderDetails', 32] }).findOne();

    return res.status(404).json({
      message: 'not found',
      payload: order
    });
  } catch (e) {
    console.log('e', e);
    return next(e);
  }
};
