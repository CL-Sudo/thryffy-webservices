import R from 'ramda';

/**
 *
 * @param {Array} categories
 * @param {Array} suggestions
 * @param {String} keyword
 */

export const mergeCategoryWithSuggestions = (categories, suggestions, keyword) => {
  const assignKeyword = category => R.assoc('keyword', keyword)({ category });

  const attachedSuggestions = R.map(assignKeyword);
  const mergeArr = R.concat(R.__, suggestions);

  const attachedHistories = R.pipe(attachedSuggestions, mergeArr)(categories);

  return attachedHistories;
};
