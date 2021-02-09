import { Categories, CategorySize, Sizes } from '@models';
import Type from '@constants/size.constant';
import R from 'ramda';

export const seedSizes = async (type, categoryId) =>
  new Promise(async (resolve, reject) => {
    try {
      const waitSize = 'waistSize';
      const uk = 'uk';
      const international = 'international';
      const age = 'age';
      const sizesId = R.map(R.prop('id'))(
        await Sizes.findAll({ raw: true, attributes: ['id'], where: { type } })
      );

      const defaultType = R.cond([
        [R.equals(Type.WOMEN_CLOTHING), R.always(uk)],
        [R.equals(Type.WOMEN_PANT), R.always(waitSize)],
        [R.equals(Type.WOMEN_SHOES), R.always(uk)],
        [R.equals(Type.MEN_SHOES), R.always(uk)],
        [R.equals(Type.KID_SHOES), R.always(uk)],
        [R.equals(Type.MEN_CLOTHING), R.always(international)],
        [R.equals(Type.KID_CLOTHING), R.always(age)],
        [R.equals(Type.MEN_PANT), R.always(uk)]
      ])(type);

      const category = await Categories.findOne({ where: { id: categoryId } });
      await category.update({ default: defaultType });

      const rows = R.map(id => ({
        categoryId,
        sizeId: id
      }))(sizesId);

      await CategorySize.bulkCreate(rows);
      return resolve();
    } catch (e) {
      return reject(e);
    }
  });
