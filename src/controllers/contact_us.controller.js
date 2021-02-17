import { constactUsValidator } from '@validators/contact_us.validator';
import formidable from 'formidable';
import { Enquiries, EnquiryImages } from '@models';
import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';
import { uploadFileToS3 } from '@tools/s3';
import { parsePathForDBStoring } from '@utils/s3.util';
import S3 from '@configs/s3.config';
import LISTENER from '@listeners/contact_us.listener';
import EVENT from '@constants/listener.constant';

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

      LISTENER.emit(EVENT.CONTACT_US.ENQUIY_SENT, payload);

      return res.status(200).json({ message: 'success', payload });
    } catch (e) {
      return next(e);
    }
  });
};
