import S3 from '@configs/s3.config';

const { SUPABASE_URL, SUPABASE_PREFIX, SUPABASE_BUCKET } = process.env;

// export const parsePathForDeleting = path => path.replace(`${S3.AWS_S3_URL}/`, '');
export const parsePathForDeleting = path =>
  path.replace(`${SUPABASE_URL}${SUPABASE_PREFIX}${SUPABASE_BUCKET}/`, '');

// export const parsePathForDBStoring = AWSPath => `${S3.AWS_S3_URL}/${AWSPath}`;
export const parsePathForDBStoring = path => `${SUPABASE_URL}${SUPABASE_PREFIX}${path}`;
