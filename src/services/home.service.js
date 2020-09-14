import { ViewHistories } from '@models';

export const saveViewHistory = (userId, productId) =>
  new Promise(async (resolve, reject) => {
    try {
      await ViewHistories.create({
        userId,
        productId
      });
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });

export const getSuggestedItems = userId =>
  new Promise(async (resolve, reject) => {
    try {
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });
