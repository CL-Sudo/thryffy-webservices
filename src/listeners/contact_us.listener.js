import { EventEmitter } from 'events';
import { sendMail } from '@tools/sendgrid';
import Moment from 'moment';
import EMAIL_TEMPLATE from '@templates/email.template';
import CONFIG from '@configs/sendgrid.config';
import EVENT from '@constants/listener.constant';
import R from 'ramda';

const contactUsListener = new EventEmitter();

const sendEmail = async data => {
  try {
    const { userId, type, subject, description = '-' } = data;

    await sendMail({
      receiverEmail: CONFIG.SENDGRID_SUPPORT_SENDER,
      template: EMAIL_TEMPLATE.CONTACT_US,
      templateData: {
        userId,
        type,
        subject,
        description,
        images: data.images.map(instance => ({ path: instance.path })),
        dateTime: Moment(data.createdAt).format('DD-MM-YY HH:mm')
      }
    });
  } catch (e) {
    console.log('e', e);
  }
};

contactUsListener.on(EVENT.CONTACT_US.ENQUIY_SENT, sendEmail);

export { contactUsListener };
export default contactUsListener;
