import { Preferences } from '@models';

Preferences.addHook('afterFind', async findResult => {
  try {
    if (findResult && !Array.isArray(findResult)) findResult = [findResult];
    if (!findResult && !Array.isArray(findResult)) findResult = [];
    findResult.forEach(instance => {
      if (instance.preferableType === 'brand' && instance.brand) {
        delete instance.condition;
        delete instance.category;
        delete instance.size;
        delete instance.dataValues.condition;
        delete instance.dataValues.category;
        delete instance.dataValues.size;
      } else if (instance.preferableType === 'category' && instance.category) {
        instance.preferable = instance.category;
        delete instance.brand;
        delete instance.condition;
        delete instance.size;
        delete instance.dataValues.brand;
        delete instance.dataValues.condition;
        delete instance.dataValues.size;
      } else if (instance.preferableType === 'condition' && instance.condition) {
        instance.preferable = instance.condition;
        delete instance.brand;
        delete instance.category;
        delete instance.size;
        delete instance.dataValues.brand;
        delete instance.dataValues.category;
        delete instance.dataValues.size;
      } else if (instance.preferableType === 'size' && instance.size) {
        instance.preferable = instance.size;
        delete instance.brand;
        delete instance.category;
        delete instance.condition;
        delete instance.dataValues.brand;
        delete instance.dataValues.category;
        delete instance.dataValues.condition;
      }
    });
  } catch (e) {
    throw e;
  }
});
