import fs from 'fs';
import _ from 'lodash';
import AWS from 'aws-sdk';
import path from 'path';
import dotenv from 'dotenv';
// import uuid from 'uuid/v4';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';

dotenv.config();
// // For dev purposes only
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3Bucket = new AWS.S3({
  params: { Bucket: process.env.AWS_S3_BUCKET, timeout: 6000000 },
  region: 'ap-southeast-1'
});
const s3BucketPublic = new AWS.S3({
  params: { Bucket: process.env.AWS_S3_BUCKET_PUBLIC, timeout: 6000000 },
  region: 'ap-southeast-1'
});

export const uploadToS3 = (
  s3Directory,
  filestream,
  extension,
  { publicAccess = true, publicBucket = false, filename } = {}
) =>
  new Promise((resolve, reject) => {
    const configs = {};
    if (publicAccess) configs.ACL = 'public-read';
    const bucket = publicBucket ? s3BucketPublic : s3Bucket;
    return bucket.upload(
      {
        Key: `${s3Directory}${filename || `${uuidv4()}${extension}`}`,
        Body: filestream,
        ...configs
      },
      (err, res) => {
        if (err) return reject(err);
        return resolve({ path: res.key, filename });
      }
    );
  });

export const deleteObjectFromS3 = (filePath, publicBucket = false) =>
  new Promise((resolve, reject) => {
    const bucket = publicBucket ? s3BucketPublic : s3Bucket;
    bucket.deleteObject({ Key: filePath }, (error, data) => {
      if (error !== null) return reject(error);
      return resolve(data);
    });
  });

export const getObjectFromS3 = (filePath, publicBucket = false) =>
  new Promise((resolve, reject) => {
    const bucket = publicBucket ? s3BucketPublic : s3Bucket;
    bucket.getObject({ Key: filePath }, (error, data) => {
      if (error != null) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });

export const uploadFileToS3 = (
  files,
  s3Directory,
  { publicAccess = false, publicBucket = false } = {}
) =>
  new Promise(async (resolve, reject) => {
    try {
      let data;
      if (_.isArray(files)) {
        const fileUploadPromises = [];
        _.forEach(files, async file => {
          const filestream = fs.readFileSync(file.path);
          let extension = path.extname(file.name);
          if (!extension)
            extension = mime.extension(file.type) ? `.${mime.extension(file.type)}` : undefined;
          fileUploadPromises.push(
            uploadToS3(s3Directory, filestream, extension, { publicAccess, publicBucket })
          );
        });
        data = await Promise.all(fileUploadPromises);
      } else {
        const filestream = fs.readFileSync(files.path);
        let extension = path.extname(files.name);
        if (!extension)
          extension = mime.extension(files.type) ? `.${mime.extension(files.type)}` : undefined;
        data = await uploadToS3(s3Directory, filestream, extension, { publicBucket });
      }
      return resolve(data);
    } catch (e) {
      return reject(e);
    }
  });

export const uploadFileStreamToS3 = ({ s3Directory, filename, fileStream, publicAccess }) => {
  const extension = path.extname(filename);
  return uploadToS3(s3Directory, fileStream, extension, { filename, publicAccess });
};
