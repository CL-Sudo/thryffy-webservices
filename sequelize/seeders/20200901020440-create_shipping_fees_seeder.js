import { ShippingFees } from '@models';
import data from '../data/shipping_fees.json';

module.exports = {
  up: async () => {
    try {
      const rows = [];
      data.forEach(d => rows.push(d));
      await ShippingFees.bulkCreate(rows);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: queryInterface => queryInterface.bulkDelete('shipping_fees')
};
