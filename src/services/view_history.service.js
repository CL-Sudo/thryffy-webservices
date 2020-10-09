import { ViewHistories, Products } from '@models';

/**
 *
 * @param {Number} productId
 * @param {Number} userId
 */
export const logView = (productId, userId) =>
  new Promise(async (resolve, reject) => {
    try {
      const product = await Products.findOne({ where: { id: productId } });

      if (product.userId !== userId) {
        await ViewHistories.create({ userId, productId });
      }

      return resolve();
    } catch (e) {
      return reject(e);
    }
  });
