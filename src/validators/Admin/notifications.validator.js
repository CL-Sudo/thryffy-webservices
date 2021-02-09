import { isEmpty } from '@validators';

export const createValidator = async (req, fields, files) => {
  try {
    if (isEmpty(fields.title)) throw new Error('Title is required');
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};
