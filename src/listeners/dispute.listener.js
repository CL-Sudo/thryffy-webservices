import { EventEmitter } from 'events';
import { Notifications, Users, Disputes } from '@models';
import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';
import NOTIFICATION_TYPE from '@constants/notification.constant';
import {
  DISPUTE_OPENED_DESCRIPTIION,
  DISPUTE_OPENED_TITLE
} from '@templates/notification.template';
import { sendCloudMessage } from '@services/notification.service';
import MODEL_CONSTANT from '@constants/model.constant';

export const disputeListener = new EventEmitter();

const pushNotification = async order => {
  try {
    const notifier = await Users.findOne({ where: { id: order.sellerId } });
    if (!notifier) throw new Error('Notifier not found');
    const dispute = await Disputes.findOne({ where: { orderId: order.id } });
    await sequelize.transaction(async transaction => {
      await Notifications.create(
        {
          title: DISPUTE_OPENED_TITLE,
          description: DISPUTE_OPENED_DESCRIPTIION,
          type: NOTIFICATION_TYPE.DISPUTE,
          notifierId: order.sellerId,
          actorId: order.userId,
          notifiableId: dispute.id,
          notifiableType: MODEL_CONSTANT.POLYMORPHISM.NOTIFICATIONS.DISPUTE
        },
        { transaction }
      );

      if (notifier.deviceToken) {
        await sendCloudMessage({
          token: notifier.deviceToken,
          title: DISPUTE_OPENED_TITLE,
          message: DISPUTE_OPENED_DESCRIPTIION,
          data: order
        });
      }
    });
  } catch (e) {
    console.log('e', e);
  }
};

disputeListener.on('DISPUTE CREATED', pushNotification);
