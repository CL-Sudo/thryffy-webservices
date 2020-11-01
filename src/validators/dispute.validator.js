import { isEmpty } from '@validators';

export const createValidator = (fields, files) =>
  new Promise(async (resolve, reject) => {
    try {
      if (isEmpty(fields.title)) throw new Error('title is required');
      if (fields.description.length > 250)
        throw new Error('description cannot be more than 250 characters');
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });
