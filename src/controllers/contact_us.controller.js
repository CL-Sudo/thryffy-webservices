import { constactUsValidator } from '@validators/contact_us.validator';
import formidable from 'formidable';
import { Enquiries, EnquiryImages, Users } from '@models';
import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';
import { uploadFileToS3 } from '@tools/s3';
import { parsePathForDBStoring } from '@utils/s3.util';
import S3 from '@configs/s3.config';
import LISTENER from '@listeners/contact_us.listener';
import EVENT from '@constants/listener.constant';

/**
 * DELETE
 */
import ENQUIRY_TYPE from '@constants/enquiry.constant';
import CONFIG from '@configs/sendgrid.config';
import { sendMail } from '@tools/sendgrid';
import EMAIL_TEMPLATE from '@templates/email.template';
import Moment from 'moment';

export const sendEnquiry = async (req, res, next) => {
  const { id } = req.user;
  const form = formidable({ multiple: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return next(err);
    try {
      await constactUsValidator(fields, files);
      const result = await sequelize.transaction(async transaction => {
        const enquiry = await Enquiries.create({ ...fields, userId: id }, { transaction });

        const paths = await Promise.all(
          Object.keys(files).map(async key => {
            const uploaded = await uploadFileToS3(files[key], S3.ENQUIRY_URL);
            return uploaded.path;
          })
        );

        const imageArr = paths.map(path => ({
          enquiryId: enquiry.id,
          path: parsePathForDBStoring(path)
        }));

        if (imageArr.length > 0) {
          await EnquiryImages.bulkCreate(imageArr, { transaction });
        }

        return enquiry;
      });

      const payload = await Enquiries.findOne({
        where: { id: result.id },
        include: [
          {
            model: EnquiryImages,
            as: 'images'
          }
        ]
      });

      // LISTENER.emit(EVENT.CONTACT_US.ENQUIY_SENT, payload);

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

      const user = await Users.findOne({ where: { id: payload.userId } });

      await sendMail({
        receiverFirstName: 'Thryffy',
        receiverEmail: decideReceiverEmail(payload.type),
        template: EMAIL_TEMPLATE.CONTACT_US,
        templateData: {
          customerName: user.fullName || user.username || 'NA',
          customerEmail: user.email || 'NA',
          userId: payload.userId,
          type: payload.type,
          subject: payload.subject,
          description: payload.description,
          images: payload.images.map(instance => ({ path: instance.path })),
          dateTime: Moment(payload.data.createdAt).format('DD-MM-YY HH:mm')
        }
      });

      return res.status(200).json({ message: 'success', payload });
    } catch (e) {
      return next(e);
    }
  });
};
