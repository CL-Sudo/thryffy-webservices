import moment from 'moment';
import { DELIVERY_STATUS } from '@constants';
import { SalesOrders } from '@models/sales_orders.model';

export const setAsDeliveredAfterShipping = async () => {
  try {
    const orders = await SalesOrders.findAll({
      where: { deliveryStatus: DELIVERY_STATUS.DELIVERED }
    });

    const ordersToBeMarked = orders.filter(instance => {
      const formattedDate = moment(instance.shippedAt).format('YYYY-MM-DD');
      const currentDate = moment();

      const diff = currentDate.diff(formattedDate, 'days');

      return diff >= 7;
    });

    await Promise.all(
      ordersToBeMarked.map(async instance => {
        await instance.update({ deliveryStatus: DELIVERY_STATUS.COMPLETED });
      })
    );

    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};
