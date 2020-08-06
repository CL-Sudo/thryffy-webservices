import _ from 'lodash';
import { variable } from '.';

export const modelAssociationsObject = model => {
  if (!variable.isClass(model)) throw new Error('type of Model should be a class');
  if (!_.has(model, 'associations')) throw new Error("Model should be an class with the 'associations' property.");

  const association = {};
  Object.keys(model.associations).forEach(key => {
    // eslint-disable-next-line no-prototype-builtins
    if (model.associations[key].hasOwnProperty('target')) association[key] = model.associations[key].target;
    // if (model.associations[key].hasOwnProperty('options')) association[key] = model.associations[key].options;
  });
  return association;
};
