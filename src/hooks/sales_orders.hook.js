import { SalesOrders, DeliveryStatuses } from '@models';
import { generateOrderNumber } from '@utils/sales_orders.util';

SalesOrders.addHook('afterCreate', async (order, options) => {
  try {
    const { transaction } = options;
    await order.update({ orderRef: generateOrderNumber(order.id) }, { transaction });
    await DeliveryStatuses.create({ orderId: order.id }, { transaction });
  } catch (e) {
    throw e;
  }
});

SalesOrders.addHook('afterFind', async results => {
  try {
    if (results && !Array.isArray(results)) {
      results = [results];
    } else if (!results && !Array.isArray(results)) {
      results = [];
    }
    await Promise.all(
      results.map(async instance => {
        await instance.checkHasReviewed();
        await instance.getItemQuantity();
      })
    );
  } catch (e) {
    throw e;
  }
});
