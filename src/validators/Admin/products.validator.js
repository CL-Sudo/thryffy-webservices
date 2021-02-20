import R from 'ramda';
import { isEmpty } from '@validators';
import { isJSON } from '@utils';

export const updateProductValidator = addProductValidator => (req, fields, files) =>
  new Promise(async (resolve, reject) => {
    try {
      const { thumbnailIndex } = fields;
      const numberOfNewImage = Object.keys(files).length;
      const imagesToPersist = R.ifElse(
        isJSON,
        param => JSON.parse(param),
        R.identity
      )(fields.imagesToPersist);

      if (
        Number(thumbnailIndex) > imagesToPersist.length + numberOfNewImage ||
        Number(thumbnailIndex < 0)
      )
        throw new Error('Invalid thumbnailIndex given.');

      await addProductValidator(req, fields);

      if (isEmpty(imagesToPersist) && R.isEmpty(files)) {
        throw new Error('Must contain at least one photo');
      }

      return resolve();
    } catch (e) {
      return reject(e);
    }
  });
