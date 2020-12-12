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
    const notifier = await Users.findOne({
      where: { id: review.sellerId }
    });
    const order = await SalesOrders.findOne({ id: review.orderId });

    if (notifier.user.notificationSetting.isOrderAllowed) {
      await sequelize.transaction(async transaction => {
        const notification = await Notifications.findOne(
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

        const data = await Notifications.findOne({ where: { id: notification.id }, transaction });

        if (notifier.deviceToken) {
          await sendCloudMessage({ title: SALE_REVIEWED, token: notifier.deviceToken, data });
        }
      });
    }
  } catch (e) {
    console.error(e);
  }
};

reviewListener.on('REVIEWED RECEIVED', pushNotification);
