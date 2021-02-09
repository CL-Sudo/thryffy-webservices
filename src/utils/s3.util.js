import S3 from '@configs/s3.config';

export const parsePathForDeleting = path => path.replace(`${S3.AWS_S3_URL}/`, '');

export const parsePathForDBStoring = AWSPath => `${S3.AWS_S3_URL}/${AWSPath}`;
