import { SalesOrders } from '@models';
import { generateOrderNumber } from '@utils/sales_orders.util';

SalesOrders.addHook('afterCreate', async (order, options) => {
  try {
    const { transaction } = options;
    await order.update({ orderRef: generateOrderNumber(order.id) }, { transaction });
  } catch (e) {
    throw e;
  }
});
