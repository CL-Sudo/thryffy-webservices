import _ from 'lodash';

/**
 *
 * @param {File} images
 */

export const parseImageWithIndex = images => {
  const parseIndex = key => Number(key.substring(6, 7));

  const result = [];

  _.mapKeys(images, (image, key) => {
    result.push({ index: parseIndex(key), image });
  });

  return result;
};
