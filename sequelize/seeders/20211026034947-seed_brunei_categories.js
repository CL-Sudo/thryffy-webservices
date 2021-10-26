import _ from 'lodash';

import { asyncSequentialMap } from '@utils';
import { Categories } from '@models';

import parentData from '../data/parent_categories.json';

import womenSecondLevelData from '../data/women_second_level_categories.json';
import menSecondLevelData from '../data/men_second_level_categories.json';
import kidsSecondLevelData from '../data/kids_second_level_categories.json';

import womenThirdLevelClothing from '../data/women_third_level_categories_clothing.json';
import womenThirdLevelBagWallet from '../data/women_third_level_bag_wallet.json';
import womenThirdLevelAccessories from '../data/women_third_level_categories_accessories.json';
import womenThirdLevelShoes from '../data/women_third_level_categories_shoes.json';

import kidsThirdLevelAccessories from '../data/kids_third_level_categories_accessories.json';
import kidsThirdLevelClothing from '../data/kids_third_level_categories_clothing.json';
import kidsThirdLevelBagWallet from '../data/kids_third_level_categories_bag_wallet.json';
import kidsThirdLevelShoes from '../data/kids_third_level_categories_shoes.json';

import menThirdLevelClothing from '../data/men_third_level_categories_clothing.json';
import menThirdLevelBagWallet from '../data/men_third_level_bag_wallet.json';
import menThirdLevelAccessories from '../data/men_third_level_categories_accessories.json';
import menThirdLevelShoes from '../data/men_third_level_categories_shoes.json';

const { COUNTRIES } = require('../../src/constants/countries.constant');

const seedWomenClothing = async parentId => {
  try {
    const data = [];
    womenThirdLevelClothing.map(obj => data.push({ ..._.omit(obj, ['shippingFeeId']), parentId }));
    await Categories.bulkCreate(data);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedMenClothing = async parentId => {
  try {
    const data = [];
    menThirdLevelClothing.map(obj => data.push({ ..._.omit(obj, ['shippingFeeId']), parentId }));
    await Categories.bulkCreate(data);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedKidsClothing = async parentId => {
  try {
    const data = [];
    kidsThirdLevelClothing.map(obj => data.push({ ..._.omit(obj, ['shippingFeeId']), parentId }));
    await Categories.bulkCreate(data);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedMenBagWallet = async parentId => {
  try {
    const data = [];
    menThirdLevelBagWallet.map(obj => data.push({ ..._.omit(obj, ['shippingFeeId']), parentId }));
    await Categories.bulkCreate(data);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedWomenBagWallet = async parentId => {
  try {
    const data = [];
    womenThirdLevelBagWallet.map(obj => data.push({ ..._.omit(obj, ['shippingFeeId']), parentId }));
    await Categories.bulkCreate(data);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedKidsBagWallet = async parentId => {
  try {
    const data = [];
    kidsThirdLevelBagWallet.map(obj => data.push({ ..._.omit(obj, ['shippingFeeId']), parentId }));
    await Categories.bulkCreate(data);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};
const seedWomenAccessories = async parentId => {
  try {
    const data = [];
    womenThirdLevelAccessories.map(obj =>
      data.push({ ..._.omit(obj, ['shippingFeeId']), parentId })
    );
    await Categories.bulkCreate(data);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedMenAccessories = async parentId => {
  try {
    const data = [];
    menThirdLevelAccessories.map(obj => data.push({ ..._.omit(obj, ['shippingFeeId']), parentId }));
    await Categories.bulkCreate(data);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedKidsAccessories = async parentId => {
  try {
    const data = [];
    kidsThirdLevelAccessories.map(obj =>
      data.push({ ..._.omit(obj, ['shippingFeeId']), parentId })
    );
    await Categories.bulkCreate(data);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedMenShoes = async parentId => {
  try {
    const data = [];
    menThirdLevelShoes.map(obj => data.push({ ..._.omit(obj, ['shippingFeeId']), parentId }));
    await Categories.bulkCreate(data);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedWomenShoes = async parentId => {
  try {
    const data = [];
    womenThirdLevelShoes.map(obj => data.push({ ..._.omit(obj, ['shippingFeeId']), parentId }));
    await Categories.bulkCreate(data);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedKidsShoes = async parentId => {
  try {
    const data = [];
    kidsThirdLevelShoes.map(obj => data.push({ ..._.omit(obj, ['shippingFeeId']), parentId }));
    await Categories.bulkCreate(data);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedWomenFirstLevel = async data => {
  try {
    const women = await Categories.create(_.omit(data, ['shippingFeeId']));
    return Promise.resolve(women.id);
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedMenFirstLevel = async data => {
  try {
    const men = await Categories.create(_.omit(data, ['shippingFeeId']));
    return Promise.resolve(men.id);
  } catch (e) {
    return Promise.reject(e);
  }
};

const seedKidsFirstLevel = async data => {
  try {
    const kids = await Categories.create(_.omit(data, ['shippingFeeId']));
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
          const cloth = await Categories.create({ ..._.omit(data, ['shippingFeeId']), parentId });
          await seedWomenClothing(cloth.id);
          break;
        }

        case 'Shoes': {
          const shoes = await Categories.create({ ..._.omit(data, ['shippingFeeId']), parentId });
          await seedWomenShoes(shoes.id);
          break;
        }

        case 'Bags & Wallets': {
          const bagWallet = await Categories.create({
            ..._.omit(data, ['shippingFeeId']),
            parentId
          });
          await seedWomenBagWallet(bagWallet.id);
          break;
        }

        case 'Accessories': {
          const accessories = await Categories.create({
            ..._.omit(data, ['shippingFeeId']),
            parentId
          });
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
          const cloth = await Categories.create({ ..._.omit(data, ['shippingFeeId']), parentId });
          await seedMenClothing(cloth.id);
          break;
        }

        case 'Shoes': {
          const shoes = await Categories.create({ ..._.omit(data, ['shippingFeeId']), parentId });
          await seedMenShoes(shoes.id);
          break;
        }

        case 'Bags & Wallets': {
          const bagWallet = await Categories.create({
            ..._.omit(data, ['shippingFeeId']),
            parentId
          });
          await seedMenBagWallet(bagWallet.id);
          break;
        }

        case 'Accessories': {
          const accessories = await Categories.create({
            ..._.omit(data, ['shippingFeeId']),
            parentId
          });
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
          const cloth = await Categories.create({ ..._.omit(data, ['shippingFeeId']), parentId });
          await seedKidsClothing(cloth.id);
          break;
        }

        case 'Shoes': {
          const shoes = await Categories.create({ ..._.omit(data, ['shippingFeeId']), parentId });
          await seedKidsShoes(shoes.id);
          break;
        }

        case 'Bags & Wallets': {
          const bagWallet = await Categories.create({
            ..._.omit(data, ['shippingFeeId']),
            parentId
          });
          await seedKidsBagWallet(bagWallet.id);
          break;
        }

        case 'Accessories': {
          const accessories = await Categories.create({
            ..._.omit(data, ['shippingFeeId']),
            parentId
          });
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
  up: async (queryInterface, Sequelize) => {
    try {
      let [brunei] = await queryInterface.sequelize.query(
        `select * from countries where code="${COUNTRIES.BRUNEI.CODE}"`,
        {
          type: Sequelize.QueryTypes.SELECT
        }
      );

      if (!brunei) {
        const countryId = await queryInterface.bulkInsert('countries', [
          {
            name: COUNTRIES.BRUNEI.NAME,
            code: COUNTRIES.BRUNEI.CODE,
            currency_symbol: COUNTRIES.BRUNEI.CURRENCY_SYMBOL
          }
        ]);
        brunei = { id: countryId };
      }

      await Promise.all(
        parentData.map(async data => {
          const { title } = data;

          switch (title) {
            case 'Women': {
              const id = await seedWomenFirstLevel({
                ..._.omit(data, ['id']),
                countryId: brunei.id
              });
              await seedWomenSecondLevel(id);
              break;
            }

            case 'Men': {
              const id = await seedMenFirstLevel({
                ..._.omit(data, ['id']),
                countryId: brunei.id
              });
              await seedMenSecondLevel(id);
              break;
            }

            case 'Kids': {
              const id = await seedKidsFirstLevel({
                ..._.omit(data, ['id']),
                countryId: brunei.id
              });
              await seedKidsSecondLevel(id);
              break;
            }

            default:
          }
        })
      );

      return queryInterface.bulkUpdate(
        'categories',
        { country_id: brunei.id },
        { country_id: null }
      );
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.resolve();
  }
};
