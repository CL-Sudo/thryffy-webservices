import _ from 'lodash';
import R from 'ramda';
import { removeRepeatedWhiteSpace } from '@validators';

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

/**
 *
 * @param {String} brand
 * @returns {String}
 */

export const normaliseBrand = brand =>
  R.pipe(
    R.trim,
    removeRepeatedWhiteSpace,
    R.toLower,
    R.split(' '),
    R.map(_.upperFirst),
    R.join(' ')
  )(brand);
