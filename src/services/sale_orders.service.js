import moment from 'moment';
import { DELIVERY_STATUS } from '@constants';
import { SalesOrders } from '@models/sales_orders.model';
import Users from '@models/users.model';
// import Notifications from '@models/notifications.model';
// import NOTIFICATION_CONSTANT from '@constants/notification.constant';
// import NOTIFIABLE_TYPE from '@constants/model.constant';
// import { DELIVERY } from '@templates/notification.template';
// import { sendCloudMessage } from './notification.service';

export const setAsDeliveredAfterShipping = async () => {
  try {
    const orders = await SalesOrders.findAll({
      where: { deliveryStatus: DELIVERY_STATUS.DELIVERED },
      include: [
        {
          model: Users,
          as: 'seller'
        },
        {
          model: Users,
          as: 'buyer'
        }
      ]
    });

    const ordersToBeMarked = orders.filter(instance => {
      const formattedDate = moment(instance.shippedAt).format('YYYY-MM-DD HH:mm:ss');
      const currentDate = moment();

      const diff = currentDate.diff(formattedDate, 'hours');

      return diff >= 24;
    });

    await Promise.all(
      ordersToBeMarked.map(async instance => {
        await instance.update({ deliveryStatus: DELIVERY_STATUS.COMPLETED });

        // const notification = await Notifications.create({
        //   title: DELIVERY.COMPLETED(instance.orderRef),
        //   type: NOTIFICATION_CONSTANT.DELIVERY_COMPLETED,
        //   actorId: instance.buyer.id,
        //   notifierId: instance.seller.id,
        //   notifiableType: NOTIFIABLE_TYPE.POLYMORPHISM.NOTIFICATIONS.SALE_ORDER,
        //   notifiableId: instance.id
        // });

        // const data = await Notifications.findOne({ where: { id: notification.id } });

        // await sendCloudMessage({
        //   title: DELIVERY.COMPLETED(instance.orderRef),
        //   token: instance.seller.deviceToken,
        //   data
        // });
      })
    );

    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};
