import { EventEmitter } from 'events';

import EVENT from '@constants/listener.constant';
import NOTIFICATION_TYPE from '@constants/notification.constant';
import NOTIFIABLE_TYPE from '@constants/model.constant';

import { sendCloudMessage } from '@services/notification.service';

import { PUBLICATION } from '@templates/notification.template';

import { Products, Notifications, Users } from '@models';

import { SequelizeConnector as Sequelize } from '@configs/sequelize-connector.config';

const publicationListener = new EventEmitter();

const sendNotification = async productId => {
  try {
    const product = await Products.scope('default').findOne({
      where: { id: productId }
    });

    const notifier = await Users.findOne({ where: { id: product.userId } });

    await Sequelize.transaction(async transaction => {
      const notification = await Notifications.create(
        {
          notifierId: notifier.id,
          notifiableId: productId,
          notifiableType: NOTIFIABLE_TYPE.POLYMORPHISM.NOTIFICATIONS.PRODUCT,
          title: PUBLICATION.UNPUBLISHED,
          type: NOTIFICATION_TYPE.PUBLICATION.UNPUBLISHED
        },
        { transaction }
      );

      const data = await Notifications.findOne({ where: { id: notification.id }, transaction });

      await sendCloudMessage({
        token: notifier.deviceToken,
        title: PUBLICATION.UNPUBLISHED,
        data: data.dataValues
      });
    });

    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

publicationListener.on(EVENT.PUBLICATION.UNPUBLISHED, sendNotification);

export default publicationListener;
