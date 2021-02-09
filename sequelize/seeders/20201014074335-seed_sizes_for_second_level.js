import { Categories } from '@models';
import TYPE from '@constants/size.constant';
import { seedSizes } from '../utils/seeder.util';

module.exports = {
  up: async () => {
    try {
      const categories = await Categories.findAll({
        include: [
          {
            model: Categories,
            as: 'parentCategory'
          }
        ]
      });

      await Promise.all(
        categories.map(async c => {
          if (c.title === 'Clothing') {
            switch (c.parentCategory.title) {
              case 'Men': {
                await seedSizes(TYPE.MEN_CLOTHING, c.id);
                await seedSizes(TYPE.MEN_PANT, c.id);
                break;
              }

              case 'Women': {
                await seedSizes(TYPE.WOMEN_CLOTHING, c.id);
                await seedSizes(TYPE.WOMEN_PANT, c.id);
                break;
              }

              case 'Kids': {
                await seedSizes(TYPE.KID_CLOTHING, c.id);
                break;
              }

              default:
            }
          }
        })
      );

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async () => Promise.resolve()
};
