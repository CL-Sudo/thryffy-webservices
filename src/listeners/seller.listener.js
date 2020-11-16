import { EventEmitter } from 'events';
import { sendCloudMessage } from '@services/notification.service';
import NOTIFICATION_TYPE from '@constants/notification.constant';
import { MARKED_AS_SHIPPED } from '@templates/notification.template';
import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';
import { Notifications, Users } from '@models';

export const sellerListener = new EventEmitter();

const pushNotification = async order => {
  try {
    const buyer = await Users.findOne({ where: { id: order.userId } });
    if (!buyer) throw new Error('Notifier not found');
    await sequelize.transaction(async transaction => {
      await Notifications.create(
        {
          title: MARKED_AS_SHIPPED,
          data: order,
          notifierId: buyer.id,
          actorId: order.sellerId,
          type: NOTIFICATION_TYPE.MARKED_AS_SHIPPED
        },
        { transaction }
      );
      await sendCloudMessage({ token: buyer.deviceToken, title: MARKED_AS_SHIPPED, data: order });
    });
  } catch (e) {
    console.error(e);
  }
};

sellerListener.on('MARKED AS SHIPPED', pushNotification);
