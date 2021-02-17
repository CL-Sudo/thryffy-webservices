import R from 'ramda';
import moment from 'moment';

import { EventEmitter } from 'events';
import {
  SalesOrders,
  Notifications,
  Users,
  Disputes,
  DisputesImages,
  ResponseImages,
  NotificationSettings
} from '@models';
import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';

import { sendCloudMessage } from '@services/notification.service';

import NOTIFICATION_TYPE from '@constants/notification.constant';
import MODEL_CONSTANT from '@constants/model.constant';
import LISTENER from '@constants/listener.constant';

import EMAIL_TEMPLATE from '@templates/email.template';
import {
  DISPUTE_OPENED_DESCRIPTIION,
  DISPUTE_OPENED_TITLE
} from '@templates/notification.template';

import { sendMail } from '@tools/sendgrid';

import SENDGRID_CONFIG from '@configs/sendgrid.config';

export const disputeListener = new EventEmitter();

const pushNotification = async order => {
  try {
    const notifier = await Users.findOne({
      where: { id: order.sellerId },
      include: [{ model: NotificationSettings, as: 'notificationSetting' }]
    });

    if (notifier.notificationSetting.isOrderAllowed) {
      const dispute = await Disputes.findOne({ where: { orderId: order.id } });
      await sequelize.transaction(async transaction => {
        const notification = await Notifications.create(
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

        const data = await Notifications.findOne({ where: { id: notification.id }, transaction });

        if (notifier.deviceToken) {
          await sendCloudMessage({
            token: notifier.deviceToken,
            title: DISPUTE_OPENED_TITLE,
            message: DISPUTE_OPENED_DESCRIPTIION,
            data
          });
        }
      });
    }
  } catch (e) {
    console.log('e', e);
  }
};

const sendEmailToAdmin = async response => {
  try {
    const order = await SalesOrders.findOne({
      id: response.dispute.orderId
    });

    const seller = await Users.findeOne({ where: { id: order.sellerId } });

    const disputeTitle = response.dispute.title;
    const disputeDescription = response.dispute.description;
    const disputeDateTime = moment(response.dispute.createdAt).format('DD-MM-YY HH:mm');
    const disputeImages = R.map(images => ({ path: images.path }))(
      await DisputesImages.findAll({ where: { disputeId: response.disputeId } })
    );

    const responseDescription = response.response;
    const responseDateTime = moment(response.dispute.createdAt).format('DD-MM-YY HH:mm');
    const responseImages = R.map(images => ({ path: images.path }))(
      await ResponseImages.findAll({ where: { responseId: response.id } })
    );

    await sendMail({
      template: EMAIL_TEMPLATE.DISPUTE_RESPONDED_EMAIL,
      // type: SENDGRID_CONFIG.TYPE.SUPPORT,
      receiverEmail: SENDGRID_CONFIG.SENDGRID_SUPPORT_SENDER,
      templateData: {
        sellerName: seller.fullName || seller.username || seller.email,
        transactionId: order.transactionId,
        disputeTitle,
        disputeDescription,
        disputeDateTime,
        disputeImages,
        response: responseDescription,
        responseDateTime,
        responseImages
      }
    });
  } catch (e) {
    console.log('e', e);
  }
};

const sendEmailWhenBuyerDispute = async (order, dispute) => {
  try {
    const buyer = await Users.findOne({ where: { id: order.userId } });

    const disputeTitle = dispute.title;
    const disputeDescription = dispute.description;
    const disputeDateTime = moment(dispute.createdAt).format('DD-MM-YY HH:mm');
    const disputeImages = R.map(images => ({ path: images.path }))(
      await DisputesImages.findAll({ where: { disputeId: dispute.id } })
    );

    await sendMail({
      template: EMAIL_TEMPLATE.DISPUTE_CREATED_EMAIL,
      receiverEmail: SENDGRID_CONFIG.SENDGRID_SUPPORT_SENDER,
      templateData: {
        buyerName: buyer.fullName || buyer.username || buyer.email,
        transactionId: order.transactionId,
        disputeTitle,
        disputeDescription,
        disputeDateTime,
        disputeImages
      }
    });
  } catch (e) {
    console.log('e', e);
  }
};

disputeListener.on(LISTENER.DISPUTE.CREATED, pushNotification);
disputeListener.on(LISTENER.DISPUTE.CREATED, sendEmailWhenBuyerDispute);

disputeListener.on(LISTENER.DISPUTE.RESPONSE_CREATED, sendEmailToAdmin);
