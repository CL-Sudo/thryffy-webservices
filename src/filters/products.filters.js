import * as _ from 'lodash';

export const removeMyProducts = (productList, myUserId) =>
  _.filter(productList, instance => instance.userId !== myUserId);
