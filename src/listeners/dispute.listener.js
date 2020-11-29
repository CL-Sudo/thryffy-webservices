import R from 'ramda';
import moment from 'moment';

import { EventEmitter } from 'events';
import { Notifications, Users, Disputes, DisputesImages, ResponseImages } from '@models';
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

const sendEmailToAdmin = async response => {
  try {
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
      template: EMAIL_TEMPLATE.DISPUTE_EMAIL,
      type: SENDGRID_CONFIG.TYPE.DISPUTE,
      receiverEmail: SENDGRID_CONFIG.ADMIN_EMAIL,
      templateData: {
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

disputeListener.on(LISTENER.DISPUTE.CREATED, pushNotification);
disputeListener.on(LISTENER.DISPUTE.RESPONSE_CREATED, sendEmailToAdmin);
