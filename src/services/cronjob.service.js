/* eslint-disable no-console */
import { Notifications, SalesOrders, Users } from '@models';
import { DELIVERY_STATUS, PAYMENT_STATUS } from '@constants';
import { MESSAGE_FOR_EMAIL_REMINDER_TO_SHIP } from '@templates/email.template';
import { HOURS_TO_REMIND, MAX_HOUR_BEFORE_SHIPPING } from '@constants/cronjob.constant';
import NOTIFICATION_CONSTANT from '@constants/notification.constant';
import NOTIFIABLE_TYPE from '@constants/model.constant';
import { DELIVERY } from '@templates/notification.template';
import { sendCloudMessage } from './notification.service';

export const remindSellerToShipParcel = async () => {
  try {
    const operations = [];

    const orders = await SalesOrders.findAll({
      where: {
        paymentStatus: PAYMENT_STATUS.SUCCESS,
        deliveryStatus: DELIVERY_STATUS.TO_SHIP
      },
      include: [
        {
          model: Users,
          as: 'seller'
        }
      ]
    });

    HOURS_TO_REMIND.forEach((hour, index) => {
      orders.forEach(order => {
        if (order.hoursAfterPayment >= hour && order.shippingReminderCount === index) {
          operations.push(
            new Promise(async (resolve, reject) => {
              try {
                const hoursLeftToShip = MAX_HOUR_BEFORE_SHIPPING - order.hoursAfterPayment;
                let message;

                if (hoursLeftToShip <= 24 && hoursLeftToShip > 12) {
                  message = MESSAGE_FOR_EMAIL_REMINDER_TO_SHIP.LEFT_24_HOURS(order.parcelName);
                }

                if (hoursLeftToShip <= 12) {
                  message = MESSAGE_FOR_EMAIL_REMINDER_TO_SHIP.LEFT_12_HOURS(order.parcelName);
                }

                // await Sequelize.transaction(async transaction => {
                const notification = await Notifications.create({
                  notifierId: order.seller.id,
                  notifiableId: order.id,
                  notifiableType: NOTIFIABLE_TYPE.POLYMORPHISM.NOTIFICATIONS.SALE_ORDER,
                  title: message,
                  type: NOTIFICATION_CONSTANT.REMIND_SELLER_TO_SHIP_PARCEL,
                  deeplink: `thryffy://orders/seller/${order.id}`
                });

                const data = await Notifications.findOne({
                  where: { id: notification.id }
                });

                await sendCloudMessage({
                  title: message,
                  token: order.seller.deviceToken,
                  data
                });
                // });

                await order.increment('shippingReminderCount');
                return resolve();
              } catch (e) {
                return reject(e);
              }
            })
          );
        }
      });
    });

    await Promise.all(operations);

    return Promise.resolve();
  } catch (e) {
    console.log(`=====================remindSellerToShipParcel=====================`);
    console.log(`e`, e);
    console.log(`=====================remindSellerToShipParcel=====================`);
    return Promise.reject(e);
  }
};

export const remindBuyerOfRefund = async () => {
  try {
    const operations = [];
    const orders = await SalesOrders.findAll({
      where: {
        paymentStatus: PAYMENT_STATUS.SUCCESS,
        deliveryStatus: DELIVERY_STATUS.TO_SHIP,
        hasRefunded: false,
        hasRemindedBuyerOfRefund: false
      },
      include: [
        {
          model: Users,
          as: 'buyer'
        },
        {
          model: Users,
          as: 'seller'
        }
      ]
    }).then(unfilteredOrders => {
      return unfilteredOrders.filter(order => order.hoursAfterPayment >= MAX_HOUR_BEFORE_SHIPPING);
    });

    orders.forEach(order => {
      operations.push(
        new Promise(async (resolve, reject) => {
          try {
            const notification = await Notifications.create({
              title: DELIVERY.NOT_DELIVERED_WITHIN_MAX_HOUR.BUYER,
              notifierId: order.buyer.id,
              actorId: order.seller.id,
              type: NOTIFICATION_CONSTANT.PARCEL_NOT_DELIVERED_WITHIN_MAX_HOUR,
              notifiableType: NOTIFIABLE_TYPE.POLYMORPHISM.NOTIFICATIONS.SALE_ORDER,
              notifiableId: order.id
            });

            const data = await Notifications.findOne({ where: { id: notification.id } });

            await sendCloudMessage({
              title: DELIVERY.NOT_DELIVERED_WITHIN_MAX_HOUR.BUYER,
              token: order.buyer.deviceToken,
              data
            });

            await order.update({ hasRemindedBuyerOfRefund: true });
            return resolve();
          } catch (e) {
            return reject(e);
          }
        })
      );
    });

    await Promise.all(operations);

    return Promise.resolve();
  } catch (e) {
    console.log(`===================== remindBuyerOfRefund =====================`);
    console.log(`e`, e);
    console.log(`===================== remindBuyerOfRefund =====================`);
    return Promise.reject(e);
  }
};
