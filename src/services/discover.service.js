import R from 'ramda';
import { Products, Categories } from '@models';
import { SequelizeConnector as Sequelize } from '@configs/sequelize-connector.config';
import { parseKeywordForNLP } from '@utils/query.util';

export const getMostRelevantCategories = async keyword =>
  new Promise(async (resolve, reject) => {
    try {
      const products = await Products.findAll({
        include: [
          {
            model: Categories,
            as: 'category'
          }
        ],
        where: [
          {},
          Sequelize.literal(
            `MATCH (products.title, products.description) AGAINST ('${parseKeywordForNLP(
              keyword
            )}' IN NATURAL LANGUAGE MODE)`
          )
        ],
        limit: 3
      });

      const result = R.pipe(R.map(R.path(['categories', 'title'])), R.uniq)(products);

      return resolve(result);
    } catch (e) {
      return reject(e);
    }
  });

/**
 *
 * @param {Number} parentId
 * @param {Array} prevAcc
 * @returns {Array} Array
 */
export const getChildIds = (parentId, prevAcc = []) =>
  new Promise(async (resolve, reject) => {
    try {
      const categories = await Categories.findAll({
        attributes: ['id'],
        raw: true,
        where: { parentId }
      });

      const currentAcc = R.map(R.prop('id'), categories);

      if (R.isEmpty(currentAcc)) return resolve(prevAcc);

      const childIds = R.concat(prevAcc)(currentAcc);

      return resolve(await getChildIds(currentAcc, childIds));
    } catch (e) {
      return reject(e);
    }
  });
