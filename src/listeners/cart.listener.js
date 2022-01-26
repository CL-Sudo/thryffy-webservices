/* eslint-disable no-console */
import moment from 'moment';
import R from 'ramda';

import { EventEmitter } from 'events';
import {
  CartItems,
  Users,
  Notifications,
  Addresses,
  NotificationSettings,
  SalesOrders
} from '@models';
import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';
import { sendCloudMessage } from '@services/notification.service';

import SENDGRID_CONFIG from '@configs/sendgrid.config';

import { SALE_MADE_SELLER, PAYMENT } from '@templates/notification.template';
import EMAIL_TEMPLATE from '@templates/email.template';

import { sendMail } from '@tools/sendgrid';

import NOTIFICATION_TYPE from '@constants/notification.constant';
import MODEL_CONSTANT from '@constants/model.constant';
import LISTENER from '@constants/listener.constant';

export const cartListener = new EventEmitter();

const pushNotification = async (productIds, orderData) => {
  try {
    const order = await SalesOrders.findOne({ where: { id: orderData.id } });

    const seller = await Users.findOne({
      where: { id: order.sellerId },
      include: [{ model: NotificationSettings, as: 'notificationSetting' }]
    });

    const buyer = await Users.findOne({ where: { id: order.userId } });

    await sequelize.transaction(async transaction => {
      const notification = await Notifications.create(
        {
          title: SALE_MADE_SELLER.TITLE,
          description: SALE_MADE_SELLER.DESCRIPTION,
          notifierId: seller.id,
          actorId: order.userId,
          type: NOTIFICATION_TYPE.SALE_MADE,
          notifiableId: order.id,
          notifiableType: MODEL_CONSTANT.POLYMORPHISM.NOTIFICATIONS.SALE_ORDER
        },
        { transaction }
      );

      const data = await Notifications.findOne({ where: { id: notification.id }, transaction });

      await sendCloudMessage({
        token: seller.deviceToken,
        title: SALE_MADE_SELLER.TITLE,
        message: SALE_MADE_SELLER.DESCRIPTION,
        data
      });

      // const sellerNotification = await Notifications.create(
      //   {
      //     title: REMIND_TAKE_PHOTO,
      //     notifierId: seller.id,
      //     actorId: order.userId,
      //     type: NOTIFICATION_TYPE.REMIND_TAKE_PHOTO_BEFORE_SHIPPING,
      //     notifiableId: order.id,
      //     notifiableType: MODEL_CONSTANT.POLYMORPHISM.NOTIFICATIONS.SALE_ORDER
      //   },
      //   { transaction }
      // );

      // const sellerNotificationData = await Notifications.findOne({
      //   where: { id: sellerNotification.id },
      //   transaction
      // });

      // await sendCloudMessage({
      //   token: seller.deviceToken,
      //   title: NOTIFICATION_TYPE.REMIND_TAKE_PHOTO_BEFORE_SHIPPING,
      //   data: sellerNotificationData
      // });
    });

    // await sequelize.transaction(async transaction => {
    //   const shippingReminderNotification = await Notifications.create(
    //     {
    //       title: MESSAGE_FOR_EMAIL_REMINDER_TO_SHIP.LEFT_48_HOURS(order.parcelName),
    //       notifierId: seller.id,
    //       actorId: order.useId,
    //       type: NOTIFICATION_TYPE.REMIND_SELLER_TO_SHIP_PARCEL,
    //       notifiableId: order.id,
    //       notifiableType: MODEL_CONSTANT.POLYMORPHISM.NOTIFICATIONS.SALE_ORDER,
    //       deeplink: `thryffy://orders/seller/${order.id}`
    //     },
    //     { transaction }
    //   );

    //   const shippingReminderNotificationData = await Notifications.findOne({
    //     where: { id: shippingReminderNotification.id },
    //     transaction
    //   });

    //   await sendCloudMessage({
    //     token: seller.deviceToken,
    //     title: MESSAGE_FOR_EMAIL_REMINDER_TO_SHIP.LEFT_48_HOURS(order.parcelName),
    //     data: shippingReminderNotificationData
    //   });
    // });

    await sequelize.transaction(async transaction => {
      const notification = await Notifications.create(
        {
          title: PAYMENT.ORDER.SUCCESS(order.orderRef),
          notifierId: order.userId,
          actorId: order.userId,
          type: NOTIFICATION_TYPE.PAYMENT.ORDER.SUCCESS,
          notifiableId: order.id,
          notifiableType: MODEL_CONSTANT.POLYMORPHISM.NOTIFICATIONS.SALE_ORDER
        },
        { transaction }
      );

      const data = await Notifications.findOne({ where: { id: notification.id }, transaction });

      await sendCloudMessage({
        token: buyer.deviceToken,
        title: PAYMENT.ORDER.SUCCESS(order.orderRef),
        data
      });
    });
  } catch (e) {
    console.error('e', e);
  }
};

const sendEmail = async (_, order) => {
  try {
    const receiver = await Users.findOne({ where: { id: order.userId }, include: ['country'] });
    const address = await Addresses.findOne({ where: { id: order.addressId } });

    const receiverFullName = receiver.fullName || receiver.username;
    const receiverEmail = receiver.email;
    const { addressLine1, addressLine2, postcode, city, state, phoneNumber } = address;
    const { orderRef } = order;
    const dateTime = moment(order.createdAt).format('Do MMMM YYYY HH:mm');
    const { subTotal } = order;
    const { tax } = order;
    const shippingFee = order.shippingFee.price;
    const { total } = order;
    const items = R.map(item => ({
      title: item.product.title,
      condition: item.product.condition.title,
      size: R.pathOr('N/A', ['product', 'size', `${item.product.category.default}`])(item),
      price: `${item.product.displayPrice.toFixed(2)}`
    }))(order.orderItems);

    await sendMail({
      receiverEmail,
      template: EMAIL_TEMPLATE.INVOICE_TEMPLATE,
      type: SENDGRID_CONFIG.TYPE.BILLING,
      templateData: {
        currencySymbol: receiver.country.currencySymbol,
        receiverFullName,
        addressLine1,
        addressLine2,
        postcode,
        city,
        state,
        phoneNumber,
        orderRef,
        dateTime,
        subTotal: `${subTotal.toFixed(2)}`,
        tax: `${tax.toFixed(2)}`,
        shippingFee: `${shippingFee.toFixed(2)}`,
        total: `${total}`,
        items
      }
    });

    // await sendMail({
    //   receiverEmail: order.seller.email,
    //   receiverFirstName: order.seller.firstName || '',
    //   receiverLastName: order.seller.lastName || '',
    //   template: EMAIL_TEMPLATE.SELLER_SHIPPING_REMINDER,
    //   templateData: {
    //     message: MESSAGE_FOR_EMAIL_REMINDER_TO_SHIP.LEFT_48_HOURS(order.parcelName)
    //   }
    // });
  } catch (e) {
    console.log('e', e);
  }
};

const removeCartItems = async productIds => {
  try {
    await sequelize.transaction(async transaction => {
      await CartItems.destroy({ where: { productId: productIds }, transaction });
    });
  } catch (e) {
    console.log('e', e);
  }
};

const pushFailedPaymentNotification = async orderId => {
  try {
    await sequelize.transaction(async transaction => {
      const order = await SalesOrders.scope({
        method: ['orderDetails', orderId]
      }).findOne({ transaction });

      const buyer = await Users.findOne({ where: { id: order.userId }, transaction });

      const notification = await Notifications.create(
        {
          title: PAYMENT.ORDER.FAILED,
          notifierId: order.userId,
          actorId: order.userId,
          type: NOTIFICATION_TYPE.PAYMENT.ORDER.FAILED,
          notifiableId: order.id,
          notifiableType: MODEL_CONSTANT.POLYMORPHISM.NOTIFICATIONS.SALE_ORDER
        },
        { transaction }
      );

      const data = await Notifications.findOne({ where: { id: notification.id }, transaction });

      await sendCloudMessage({
        token: buyer.deviceToken,
        title: PAYMENT.ORDER.FAILED,
        data
      });
    });
  } catch (e) {
    console.log(`e`, e);
  }
};

cartListener.on(LISTENER.CART.PAYMENT_MADE, pushNotification);
cartListener.on(LISTENER.CART.PAYMENT_MADE, sendEmail);
cartListener.on(LISTENER.CART.PAYMENT_MADE, removeCartItems);

cartListener.on(LISTENER.CART.PAYMENT_NOT_MADE, pushFailedPaymentNotification);
