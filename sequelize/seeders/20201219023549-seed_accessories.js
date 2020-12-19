import { Categories } from '@models';

import kidAccessories from '../data/kids_third_level_categories_accessories.json';
import menAccessories from '../data/men_third_level_categories_accessories.json';
import womenAccessories from '../data/women_third_level_categories_accessories.json';

const createMenThirdLevelAccessories = async () => {
  try {
    const menAcc = await Categories.findOne({
      where: { title: 'Accessories' },
      include: [{ model: Categories, as: 'parentCategory', where: { title: 'Men' } }]
    });
    const data = menAccessories.map(instance => ({ ...instance, parentId: menAcc.id }));
    await Categories.bulkCreate(data);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};
const createWomenThirdLevelAccessories = async () => {
  try {
    const womenAcc = await Categories.findOne({
      where: { title: 'Accessories' },
      include: [{ model: Categories, as: 'parentCategory', where: { title: 'Women' } }]
    });
    const data = womenAccessories.map(instance => ({ ...instance, parentId: womenAcc.id }));
    await Categories.bulkCreate(data);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};
const createKidsThirdLevelAccessories = async () => {
  try {
    const kidsAcc = await Categories.findOne({
      where: { title: 'Accessories' },
      include: [{ model: Categories, as: 'parentCategory', where: { title: 'Kids' } }]
    });
    const data = kidAccessories.map(instance => ({ ...instance, parentId: kidsAcc.id }));
    await Categories.bulkCreate(data);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await createKidsThirdLevelAccessories();
      await createMenThirdLevelAccessories();
      await createWomenThirdLevelAccessories();
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => Promise.resolve()
};
