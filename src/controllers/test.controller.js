import { sendMail } from '@tools/sendgrid';
import CONFIG from '@configs/sendgrid.config';
import TEMPLATE from '@constants/sendgrid.constant';

export const test = async (req, res, next) => {
  try {
    await sendMail({
      receiverEmail: 'elgoogym0001@gmail.com',
      receiverFirstName: 'ching Lung',
      receiverLastName: 'lau',
      type: CONFIG.TYPE.ENQUIRY,
      template: TEMPLATE.TEST
    });
    return res.status(404).json({
      message: 'not found'
    });
  } catch (e) {
    console.log('e', e.response.data.errors);
    return next(e);
  }
};
