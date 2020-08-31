import data from '../data/parent_categories.json';

const rows = [];
data.forEach(obj => {
  rows[rows.length] = obj;
});
module.exports = {
  up: queryInterface => queryInterface.bulkInsert('categories', rows),
  down: queryInterface => queryInterface.bulkDelete('categories')
};
