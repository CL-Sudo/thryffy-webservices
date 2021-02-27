import { EventEmitter } from 'events';
import { sendMail } from '@tools/sendgrid';
import ENQUIRY_TYPE from '@constants/enquiry.constant';
import Moment from 'moment';
import EMAIL_TEMPLATE from '@templates/email.template';
import CONFIG from '@configs/sendgrid.config';
import EVENT from '@constants/listener.constant';

const contactUsListener = new EventEmitter();

const sendEmail = async data => {
  try {
    const { userId, type, subject, description = '-' } = data;

    const decideReceiverEmail = enquiryType => {
      switch (enquiryType) {
        case ENQUIRY_TYPE.BILLING:
          return CONFIG.SENDGRID_BILLING_SENDER;

        case ENQUIRY_TYPE.ENQUIRIES:
          return CONFIG.SENDGRID_ENQUIRY_SENDER;

        case ENQUIRY_TYPE.SUPPORT:
          return CONFIG.SENDGRID_SUPPORT_SENDER;

        default:
          throw new Error('Invalid type given');
      }
    };

    await sendMail({
      receiverEmail: decideReceiverEmail(type),
      senderEmail: CONFIG.SENDGRID_ROOT_SENDER,
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
