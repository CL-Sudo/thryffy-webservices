import { EventEmitter } from 'events';
import EMAIL_TEMPLATE from '@templates/email.template';
import LISTENER_EVENT from '@constants/listener.constant';
import { sendMail } from '@tools/sendgrid';

export const authListener = new EventEmitter();

const sendWelcomeEmail = async user => {
  try {
    // await sendMail({
    //   receiverEmail: user.email,
    //   template: EMAIL_TEMPLATE.WELCOME_EMAIL,
    //   templateData: {
    //     username: user.fullName || user.username
    //   }
    // });
  } catch (e) {
    console.log(e);
  }
};

authListener.on(LISTENER_EVENT.AUTHENTICATION.SIGNUP, sendWelcomeEmail);
