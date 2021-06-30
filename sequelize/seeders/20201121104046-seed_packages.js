const now = new Date();
const data = [
  { id: 1, title: 'Startup Plan', listing: 50, price: 9.99, created_at: now },
  { id: 2, title: 'Medium Plan', listing: 250, price: 29.99, created_at: now },
  { id: 3, title: 'Enterprise Plan', listing: 0, price: 88.88, created_at: now }
];

module.exports = {
  up: async queryInterface => {
    await queryInterface.bulkInsert('packages', data);
    return Promise.resolve();
  },

  down: async queryInterface => queryInterface.bulkDelete('packages')
};
