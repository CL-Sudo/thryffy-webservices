export * from './utils';
export * from './auth.util';
export * from './discover.util';
export * from './product.utils';

export const isJSON = param => {
  try {
    JSON.parse(param);
    return true;
  } catch (e) {
    return false;
  }
};
