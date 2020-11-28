import { foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async queryInterface => {
    try {
      await queryInterface.removeColumn('products', 'condition');
      await queryInterface.addColumn('products', 'condition_id', {
        ...foreignKey('condition_id', 'conditions', false),
        after: 'markup_price'
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async () => Promise.resolve()
};
