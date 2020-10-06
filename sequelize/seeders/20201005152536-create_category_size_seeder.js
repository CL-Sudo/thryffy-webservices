import { Categories, CategorySize, Sizes } from '@models';
import Type from '@constants/size.constant';
import R from 'ramda';

const seedSizes = async (type, categoryId) =>
  new Promise(async (resolve, reject) => {
    try {
      const sizesId = R.map(R.prop('id'))(
        await Sizes.findAll({ raw: true, attributes: ['id'], where: { type } })
      );

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

module.exports = {
  up: async () => {
    try {
      const isMen = R.equals('Men');
      const isWomen = R.equals('Women');
      const isKid = R.equals('Kids');

      const categories = await Categories.findAll({
        attributes: ['id', 'title', 'parentId']
      });

      await Promise.all(
        R.map(async c => {
          const root = await c.getRoot();
          if (isWomen(root.title)) {
            if (
              c.title !== 'Women' ||
              c.title === 'Lingerie' ||
              c.title === 'Underwears' ||
              c.title === 'Tops & T-Shirts' ||
              c.title === 'Shirts' ||
              c.title === 'Upper Active Wears' ||
              c.title === 'Night Wears' ||
              c.title === 'Skirts' ||
              c.title === 'Dresses' ||
              c.title === 'Jumpsuits & Rompers' ||
              c.title === 'Swim Suits' ||
              c.title === 'Special Costumes & Outfits' ||
              c.title === 'Sweaters' ||
              c.title === 'Winter Jackets' ||
              c.title === 'Jackets' ||
              c.title === 'Coats' ||
              c.title === 'Suits' ||
              c.title === 'Blazers'
            ) {
              await seedSizes(Type.WOMEN_CLOTHING, c.id);
            } else if (
              c.title !== 'Women' ||
              c.title === 'Tights & Pantyhoses' ||
              c.title === 'Leggings' ||
              c.title === 'Shorts & Capri Pants' ||
              c.title === 'Lower Active Wears'
            ) {
              await seedSizes(Type.WOMEN_PANT, c.id);
            } else if (c.title === 'Socks' || c.title === 'Shoes' || c.title !== 'Women') {
              await seedSizes(Type.WOMEN_SHOES, c.id);
            }
          } else if (isMen(root.title)) {
            if (
              c.title !== 'Men' ||
              c.title === 'Underwears' ||
              c.title === 'Tops & T-Shirts' ||
              c.title === 'Shirts' ||
              c.title === 'Upper Active Wears' ||
              c.title === 'Pajamas Tops' ||
              c.title === 'Active Wears' ||
              c.title === 'Swim Wears' ||
              c.title === 'Sweaters' ||
              c.title === 'Winter Jackets' ||
              c.title === 'Jackets' ||
              c.title === 'Coats' ||
              c.title === 'Suits' ||
              c.title === 'Blazers'
            ) {
              await seedSizes(Type.MEN_CLOTHING, c.id);
            } else if (
              c.title !== 'Men' ||
              c.title === 'Pajamas Pants' ||
              c.title === 'Pants' ||
              c.title === 'Jeans' ||
              c.title === 'Lower Active Wears' ||
              c.title === 'Swim Trunks'
            ) {
              await seedSizes(Type.MEN_PANT, c.id);
            } else if (c.title === 'Socks' || c.title === 'Shoes' || c.title !== 'Men') {
              await seedSizes(Type.MEN_SHOES, c.id);
            }
          } else if (isKid(root.title)) {
            if (
              c.title !== 'Kids' ||
              c.title === 'Baby Clothing' ||
              c.title === 'Bottoms' ||
              c.title === 'Dresses' ||
              c.title === 'One Pieces' ||
              c.title === 'Pajamas' ||
              c.title === 'Shirts & Tops' ||
              c.title === 'Swims' ||
              c.title === 'Costumes' ||
              c.title === 'Jackets' ||
              c.title === 'Coats' ||
              c.title === 'Suits' ||
              c.title === 'Blazers' ||
              c.title === 'Special Costumes & Outfits'
            ) {
              await seedSizes(Type.KID_CLOTHING, c.id);
            } else if (c.title === 'Shoes' || c.title !== 'Kids') {
              await seedSizes(Type.KID_SHOES);
            }
          }
        })(categories)
      );

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: queryInterface => queryInterface.bulkDelete('category_size')
};
