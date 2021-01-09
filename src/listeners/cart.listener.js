import moment from 'moment';
import R from 'ramda';

import { EventEmitter } from 'events';
import { CartItems, Users, Notifications, Addresses, NotificationSettings } from '@models';
import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';
import { sendCloudMessage } from '@services/notification.service';

import SENDGRID_CONFIG from '@configs/sendgrid.config';

import { SALE_MADE_SELLER } from '@templates/notification.template';
import EMAIL_TEMPLATE from '@templates/email.template';

import { sendMail } from '@tools/sendgrid';

import NOTIFICATION_TYPE from '@constants/notification.constant';
import MODEL_CONSTANT from '@constants/model.constant';
import LISTENER from '@constants/listener.constant';

export const cartListener = new EventEmitter();

const pushNotification = async (productIds, order) => {
  try {
    const seller = await Users.findOne({
      where: { id: order.sellerId },
      include: [{ model: NotificationSettings, as: 'notificationSetting' }]
    });
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
        title: SALE_MADE_SELLER,
        message: SALE_MADE_SELLER.DESCRIPTION,
        data
      });
    });
  } catch (e) {
    console.error('e', e);
  }
};

const sendEmail = async (_, order) => {
  try {
    const receiver = await Users.findOne({ where: { id: order.userId } });
    const address = await Addresses.findOne({ where: { id: order.addressId } });

    const receiverFullName = receiver.fullName;
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
      size: item.product.size[item.product.category.default],
      price: `${item.product.displayPrice}`
    }))(order.orderItems);

    await sendMail({
      receiverFullName,
      receiverEmail,
      template: EMAIL_TEMPLATE.INVOICE_TEMPLATE,
      type: SENDGRID_CONFIG.TYPE.BILLING,
      templateData: {
        addressLine1,
        addressLine2,
        postcode,
        city,
        state,
        phoneNumber,
        orderRef,
        dateTime,
        subTotal: `${subTotal}`,
        tax: `${tax}`,
        shippingFee: `${shippingFee}`,
        total: `${total}`,
        items
      }
    });
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

cartListener.on(LISTENER.CART.PAYMENT_MADE, pushNotification);
cartListener.on(LISTENER.CART.PAYMENT_MADE, sendEmail);
cartListener.on(LISTENER.CART.PAYMENT_MADE, removeCartItems);
