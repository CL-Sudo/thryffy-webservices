// import { check } from 'express-validator/check';
import { Categories } from '@models';
import R from 'ramda';
import { mapObjectsToArray } from '@utils/utils';
import { CONDITION } from '@constants';

const isEmpty = param => R.isNil(param) || R.length(R.toString(param)) === 0;

export const addProductValidator = async fields =>
  new Promise(async (resolve, reject) => {
    try {
      const { title, brand, categoryId, condition, price, thumbnailIndex, colors } = fields;
      const conditions = mapObjectsToArray(CONDITION);

      if (isEmpty(categoryId)) throw new Error('categoryId: Required');
      if (isEmpty(title)) throw new Error('title: Required');
      if (isEmpty(brand)) throw new Error('brand: Required');
      if (isEmpty(colors)) throw new Error('colors: Required');
      if (isEmpty(condition)) throw new Error('condition: Required');
      if (isEmpty(price)) throw new Error('price: Required');
      if (isEmpty(thumbnailIndex)) throw new Error('thumbnailIndex: Required');
      if (R.isNil(R.find(R.equals(condition))(conditions)))
        throw new Error('Invalid condition given.');
      const category = await Categories.findOne({ raw: true, where: { id: categoryId } });
      if (!category) throw new Error('Invalid categoryId given');

      return resolve();
    } catch (e) {
      return reject(e);
    }
  });
