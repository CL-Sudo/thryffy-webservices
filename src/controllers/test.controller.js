import R from 'ramda';
import { Products } from '@models';
// import testEmitter from '../listeners/test.listener';

export const test = async (req, res, next) => {
  try {
    const parseOrderItems = async ids => {
      try {
        const products = await Products.findAll({
          attributes: ['id', 'title', 'price'],
          where: { id: ids }
        });
        const parseObj = R.applySpec({
          productId: R.prop('id'),
          itemName: R.prop('title'),
          price: R.prop('price')
        });
        const arr = R.map(parseObj)(products);
        return Promise.resolve(arr);
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const result = await parseOrderItems([1, 2]);

    return res.status(200).json({
      message: 'success',
      result
    });
  } catch (e) {
    return next(e);
  }
};
