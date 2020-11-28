import { EventEmitter } from 'events';
import { Notifications, Users, SalesOrders } from '@models';
import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';
import { SALE_REVIEWED } from '@templates/notification.template';
import NOTIFICATION_TYPE from '@constants/notification.constant';
import { sendCloudMessage } from '@services/notification.service';
import MODEL_CONSTANT from '@constants/model.constant';

export const reviewListener = new EventEmitter();

const pushNotification = async review => {
  try {
    const notifier = await Users.findOne({ where: { id: review.sellerId } });
    const order = await SalesOrders.findOne({ id: review.orderId });

    if (!notifier) throw new Error('Notifier not found');

    await sequelize.transaction(async transaction => {
      await Notifications.findOne(
        {
          title: SALE_REVIEWED,
          notifierId: notifier.id,
          actorId: order.userId,
          type: NOTIFICATION_TYPE.REVIEW_RECEIVED,
          notifiableId: review.id,
          notifiableType: MODEL_CONSTANT.POLYMORPHISM.NOTIFICATIONS.REVIEW
        },
        { transaction }
      );

      if (notifier.deviceToken) {
        await sendCloudMessage({ title: SALE_REVIEWED, token: notifier.deviceToken, data: review });
      }
    });
  } catch (e) {
    console.error(e);
  }
};

reviewListener.on('REVIEWED RECEIVED', pushNotification);
