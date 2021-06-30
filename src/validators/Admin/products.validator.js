import R from 'ramda';
import { isEmpty } from '@validators';
import { isJSON } from '@utils';

const parseImagesToPersist = fields => {
  const parseFromJSON = arr => R.map(R.ifElse(isJSON, param => JSON.parse(param), R.identity))(arr);

  const result = R.pipe(
    R.without([1]),
    parseFromJSON
  )(
    Object.keys(fields).map(key => {
      if (key.substr(0, 5) === 'image') {
        return fields[key];
      }
      return 1;
    })
  );

  return result;
};

export const updateProductValidator = addProductValidator => (req, fields, files) =>
  new Promise(async (resolve, reject) => {
    try {
      const { thumbnailIndex } = fields;
      const numberOfNewImage = Object.keys(files).length;
      // const imagesToPersist = R.ifElse(
      //   isJSON,
      //   param => JSON.parse(param),
      //   R.identity
      // )(fields.imagesToPersist);

      const imagesToPersist = parseImagesToPersist(fields);

      if (
        Number(thumbnailIndex) > imagesToPersist.length + numberOfNewImage ||
        Number(thumbnailIndex < 0)
      )
        throw new Error('Invalid thumbnailIndex given.');

      await addProductValidator(req, fields);

      if (R.isEmpty(imagesToPersist) && R.isEmpty(files)) {
        throw new Error('Must contain at least one photo');
      }

      return resolve();
    } catch (e) {
      return reject(e);
    }
  });
