import * as tools from '@tools/s3';
import { S3 } from '@constants';
import { Users } from '@models';

export const uploadProfilePicture = async ({ profilePicture, userId }) =>
  new Promise(async (resolve, reject) => {
    try {
      const { AWS_S3_URL } = process.env;
      if (profilePicture) {
        const uploaded = await tools.uploadFileToS3(profilePicture, S3.PROFILE_PHOTO_DIR);
        const user = await Users.findOne({ where: { id: userId } });
        await user.update({ profilePicture: `${AWS_S3_URL}/${uploaded.path}` });
      }
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });

export const deleteExistingProfilePicture = async userId =>
  new Promise(async (resolve, reject) => {
    try {
      const { AWS_S3_URL } = process.env;
      const user = await Users.findOne({ where: { id: userId } });
      if (user.profilePicture) {
        await tools.deleteObjectFromS3(user.profilePicture.replace(`${AWS_S3_URL}/`, ''));
        user.update({ profilePicture: null });
      }
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });
