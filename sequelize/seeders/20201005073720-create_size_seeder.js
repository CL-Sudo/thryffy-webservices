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

  down: async queryInterface => {
    try {
      await queryInterface.bulkDelete('product_colors');
      await queryInterface.bulkDelete('view_histories');
      await queryInterface.bulkDelete('products');
      await queryInterface.bulkDelete('category_size');
      await queryInterface.bulkDelete('sizes');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
