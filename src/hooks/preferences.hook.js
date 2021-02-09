import { Preferences } from '@models';

Preferences.addHook('afterFind', async findResult => {
  try {
    if (findResult && !Array.isArray(findResult)) findResult = [findResult];
    if (!findResult && !Array.isArray(findResult)) findResult = [];
    findResult.forEach(instance => {
      if (instance.preferableType === 'brand' && instance.brand) {
        delete instance.condition;
        delete instance.category;
        delete instance.dataValues.condition;
        delete instance.dataValues.category;
      } else if (instance.preferableType === 'category' && instance.category) {
        instance.preferable = instance.category;
        delete instance.brand;
        delete instance.condition;
        delete instance.dataValues.brand;
        delete instance.dataValues.condition;
      } else if (instance.preferableType === 'condition' && instance.condition) {
        instance.preferable = instance.condition;
        delete instance.brand;
        delete instance.category;
        delete instance.dataValues.brand;
        delete instance.dataValues.category;
      }
    });
  } catch (e) {
    throw e;
  }
});
