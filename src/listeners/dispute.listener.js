import { EventEmitter } from 'events';
import { Notifications, Users } from '@models';
import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';
import NOTIFICATION_TYPE from '@constants/notification.constant';
import {
  DISPUTE_OPENED_DESCRIPTIION,
  DISPUTE_OPENED_TITLE
} from '@templates/notification.template';
import { sendCloudMessage } from '@services/notification.service';

export const disputeListener = new EventEmitter();

const pushNotification = async order => {
  try {
    const notifier = await Users.findOne({ where: { id: order.sellerId } });
    await sequelize.transaction(async transaction => {
      await Notifications.create(
        {
          title: DISPUTE_OPENED_TITLE,
          description: DISPUTE_OPENED_DESCRIPTIION,
          type: NOTIFICATION_TYPE.DISPUTE,
          notifierId: order.sellerId,
          actorId: order.userId
        },
        { transaction }
      );

      await sendCloudMessage({
        token: notifier.deviceToken,
        title: DISPUTE_OPENED_TITLE,
        message: DISPUTE_OPENED_DESCRIPTIION,
        data: order
      });
    });
  } catch (e) {
    console.log('e', e);
  }
};

disputeListener.on('DISPUTE CREATED', pushNotification);
