import { EventEmitter } from 'events';
import { CartItems, Users, Notifications } from '@models';
import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';
import { sendCloudMessage } from '@services/notification.service';
import { SALE_MADE_SELLER } from '@templates/notification.template';
import NOTIFICATION_TYPE from '@constants/notification.constant';

export const cartListener = new EventEmitter();

const removeCartItems = async (productIds, order) => {
  const transaction = await sequelize.transaction();
  try {
    await CartItems.destroy({ where: { productId: productIds }, transaction });
    await transaction.commit();
  } catch (e) {
    await transaction.rollback();
    console.error('e', e);
  }
};

const pushNotification = async (productIds, order) => {
  try {
    const seller = await Users.findOne({ where: { id: order.sellerId } });
    await sequelize.transaction(async transaction => {
      await Notifications.create(
        {
          title: SALE_MADE_SELLER,
          notifierId: seller.id,
          actorId: order.userId,
          type: NOTIFICATION_TYPE.SALE_MADE
        },
        { transaction }
      );

      await sendCloudMessage({ token: seller.deviceToken, title: SALE_MADE_SELLER, data: order });
    });
  } catch (e) {
    console.error('e', e);
  }
};

cartListener.on('Payment Made', removeCartItems);
cartListener.on('Payment Made', pushNotification);
