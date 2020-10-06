import { Sizes } from '@models';
import data from '../data/sizes.json';

module.exports = {
  up: async () => {
    try {
      const rows = [];
      data.forEach(d => rows.push(d));
      await Sizes.bulkCreate(rows);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: queryInterface => queryInterface.bulkDelete('sizes')
};
