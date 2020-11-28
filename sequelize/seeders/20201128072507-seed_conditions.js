import { CONDITION } from '@constants';

const dateTime = new Date();

const data = Object.keys(CONDITION).map(key => ({
  title: CONDITION[key],
  created_at: dateTime,
  updated_at: dateTime
}));

module.exports = {
  up: async queryInterface => queryInterface.bulkInsert('conditions', data),

  down: async queryInterface => queryInterface.bulkDelete('conditions')
};
