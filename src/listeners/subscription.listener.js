import { EventEmitter } from 'events';

import moment from 'moment';

import LISTENER from '@constants/listener.constant';

import { sendMail } from '@tools/sendgrid';

import { Users, Addresses } from '@models';

import SENDGRID_CONFIG from '@configs/sendgrid.config';

import EMAIL_TEMPLATE from '@templates/email.template';

const subscriptionListner = new EventEmitter();

const sendEmail = async data => {
  try {
    const user = await Users.findOne({ where: { id: data.userId } });
    const address = await Addresses.findOne({ where: { userId: user.id, isDefault: true } });

    const receiverFullName = user.fullName;
    const receiverEmail = user.email;
    const { addressLine1, addressLine2, city, state, postcode, phoneNumber } = address;
    const dateTime = moment(data.createdAt).format('Do MMMM YYYY HH:mm');
    const expiryDate = moment(data.expiryDate).format('Do MMMM YYYY HH:mm');
    const total = `${data.package.price}`;
    const items = [
      {
        title: data.package.title,
        listing: data.package.listing,
        price: `${data.package.price}`
      }
    ];

    await sendMail({
      receiverEmail,
      type: SENDGRID_CONFIG.TYPE.BILLING,
      template: EMAIL_TEMPLATE.SUBSCRIPTION_INVOICE,
      templateData: {
        receiverFullName,
        addressLine1,
        addressLine2,
        city,
        state,
        postcode,
        phoneNumber: `${phoneNumber}`,
        dateTime,
        expiryDate,
        total: `${total}`,
        items
      }
    });
  } catch (e) {
    console.log('e', e);
  }
};

subscriptionListner.on(LISTENER.SUBSCRIPTION.CREATED, sendEmail);

export { subscriptionListner };
