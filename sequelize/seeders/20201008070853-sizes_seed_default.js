import { Sizes } from '@models';
import TYPE from '@constants/size.constant';

const waitSize = 'waistSize';
const uk = 'uk';
const international = 'international';
const age = 'age';

module.exports = {
  up: async () => {
    try {
      const sizes = await Sizes.findAll();

      await Promise.all(
        sizes.map(async size => {
          switch (size.type) {
            case TYPE.WOMEN_CLOTHING:
              await size.update({ default: uk });
              break;

            case TYPE.WOMEN_PANT:
              await size.update({ default: waitSize });
              break;

            case TYPE.WOMEN_SHOES:
            case TYPE.MEN_SHOES:
            case TYPE.KID_SHOES:
              await size.update({ default: uk });
              break;

            case TYPE.MEN_CLOTHING:
              await size.update({ default: international });
              break;

            case TYPE.KID_CLOTHING:
              await size.update({ default: age });
              break;

            case TYPE.MEN_PANT:
              await size.update({ default: uk });
              break;

            default:
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
