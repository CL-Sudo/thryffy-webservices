import { asyncSequentialMap } from '@utils';

import { Categories } from '@models';

import parentData from '../data/parent_categories.json';

import womenSecondLevelData from '../data/women_second_level_categories.json';
import menSecondLevelData from '../data/men_second_level_categories.json';
import kidsSecondLevelData from '../data/kids_second_level_categories.json';

import womenThirdLevelClothing from '../data/women_third_level_categories_clothing.json';
import womenThirdLevelBagWallet from '../data/women_third_level_bag_wallet.json';
import womenThirdLevelAccessories from '../data/women_third_level_categories_accessories.json';

import kidsThirdLevelAccessories from '../data/kids_third_level_categories_accessories.json';
import kidsThirdLevelClothing from '../data/kids_third_level_categories_clothing.json';
import kidsThirdLevelBagWallet from '../data/kids_third_level_categories_bag_wallet.json';

import menThirdLevelClothing from '../data/men_third_level_categories_clothing.json';
import menThirdLevelBagWallet from '../data/men_third_level_bag_wallet.json';
import menThirdLevelAccessories from '../data/men_third_level_categories_accessories.json';

const seedWomenClothing = async parentId => {
  try {
    const data = [];
    womenThirdLevelClothing.map(obj => data.push({ ...obj, parentId }));
    await Categories.bulkCreate(data);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedMenClothing = async parentId => {
  try {
    const data = [];
    menThirdLevelClothing.map(obj => data.push({ ...obj, parentId }));
    await Categories.bulkCreate(data);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedKidsClothing = async parentId => {
  try {
    const data = [];
    kidsThirdLevelClothing.map(obj => data.push({ ...obj, parentId }));
    await Categories.bulkCreate(data);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedMenBagWallet = async parentId => {
  try {
    const data = [];
    menThirdLevelBagWallet.map(obj => data.push({ ...obj, parentId }));
    await Categories.bulkCreate(data);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedWomenBagWallet = async parentId => {
  try {
    const data = [];
    womenThirdLevelBagWallet.map(obj => data.push({ ...obj, parentId }));
    await Categories.bulkCreate(data);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedKidsBagWallet = async parentId => {
  try {
    const data = [];
    kidsThirdLevelBagWallet.map(obj => data.push({ ...obj, parentId }));
    await Categories.bulkCreate(data);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};
const seedWomenAccessories = async parentId => {
  try {
    const data = [];
    womenThirdLevelAccessories.map(obj => data.push({ ...obj, parentId }));
    await Categories.bulkCreate(data);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedMenAccessories = async parentId => {
  try {
    const data = [];
    menThirdLevelAccessories.map(obj => data.push({ ...obj, parentId }));
    await Categories.bulkCreate(data);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedKidsAccessories = async parentId => {
  try {
    const data = [];
    kidsThirdLevelAccessories.map(obj => data.push({ ...obj, parentId }));
    await Categories.bulkCreate(data);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedWomenFirstLevel = async data => {
  try {
    const women = await Categories.create(data);
    return Promise.resolve(women.id);
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedMenFirstLevel = async data => {
  try {
    const men = await Categories.create(data);
    return Promise.resolve(men.id);
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedKidsFirstLevel = async data => {
  try {
    const kids = await Categories.create(data);
    return Promise.resolve(kids.id);
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedWomenSecondLevel = async parentId => {
  try {
    await asyncSequentialMap(womenSecondLevelData, async data => {
      const { title } = data;

      switch (title) {
        case 'Clothing': {
          const cloth = await Categories.create({ ...data, parentId });
          await seedWomenClothing(cloth.id);
          break;
        }

        case 'Shoes': {
          await Categories.create({ ...data, parentId });
          break;
        }

        case 'Bags & Wallets': {
          const bagWallet = await Categories.create({ ...data, parentId });
          await seedWomenBagWallet(bagWallet.id);
          break;
        }

        case 'Accessories': {
          const accessories = await Categories.create({ ...data, parentId });
          await seedWomenAccessories(accessories.id);
          break;
        }

        default:
      }
    });
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedMenSecondLevel = async parentId => {
  try {
    await asyncSequentialMap(menSecondLevelData, async data => {
      const { title } = data;

      switch (title) {
        case 'Clothing': {
          const cloth = await Categories.create({ ...data, parentId });
          await seedMenClothing(cloth.id);
          break;
        }

        case 'Shoes': {
          await Categories.create({ ...data, parentId });
          break;
        }

        case 'Bags & Wallets': {
          const bagWallet = await Categories.create({ ...data, parentId });
          await seedMenBagWallet(bagWallet.id);
          break;
        }

        case 'Accessories': {
          const accessories = await Categories.create({ ...data, parentId });
          await seedMenAccessories(accessories.id);
          break;
        }

        default:
      }
    });

    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedKidsSecondLevel = async parentId => {
  try {
    await asyncSequentialMap(kidsSecondLevelData, async data => {
      const { title } = data;

      switch (title) {
        case 'Clothing': {
          const cloth = await Categories.create({ ...data, parentId });
          await seedKidsClothing(cloth.id);
          break;
        }

        case 'Shoes': {
          await Categories.create({ ...data, parentId });
          break;
        }

        case 'Bags & Wallets': {
          const bagWallet = await Categories.create({ ...data, parentId });
          await seedKidsBagWallet(bagWallet.id);
          break;
        }

        case 'Accessories': {
          const accessories = await Categories.create({ ...data, parentId });
          await seedKidsAccessories(accessories.id);
          break;
        }

        default:
      }
    });

    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

module.exports = {
  up: async () => {
    try {
      await Promise.all(
        parentData.map(async data => {
          const { title } = data;

          switch (title) {
            case 'Women': {
              const id = await seedWomenFirstLevel(data);
              await seedWomenSecondLevel(id);
              break;
            }

            case 'Men': {
              const id = await seedMenFirstLevel(data);
              await seedMenSecondLevel(id);
              break;
            }

            case 'Kids': {
              const id = await seedKidsFirstLevel(data);
              await seedKidsSecondLevel(id);
              break;
            }

            default:
          }
        })
      );

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async queryInterface => {
    try {
      await queryInterface.bulkDelete('brands');
      await queryInterface.bulkDelete('categories');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
