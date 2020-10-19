const data = [
  { min_price: 1.0, max_price: 20.0, commission_rate: null, commission_price: 0.85 },
  { min_price: 20.01, max_price: 60.0, commission_rate: 0.11, commission_price: null },
  { min_price: 60.01, max_price: 100.0, commission_rate: 0.12, commission_price: null },
  { min_price: 100.01, max_price: 200.0, commission_rate: 0.13, commission_price: null },
  { min_price: 200.01, max_price: 300.0, commission_rate: 0.14, commission_price: null },
  { min_price: 300.01, max_price: null, commission_rate: 0.15, commission_price: null }
];

module.exports = {
  up: async queryInterface => {
    try {
      await queryInterface.bulkInsert('commissions', data);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async queryInterface => queryInterface.bulkDelete('commissions')
};
