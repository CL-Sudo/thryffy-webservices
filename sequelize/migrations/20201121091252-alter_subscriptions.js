import { foreignKey } from '@constants/sequelize.constant';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('subscriptions', 'description');
      await queryInterface.removeColumn('subscriptions', 'price');

      await queryInterface.addColumn('subscriptions', 'user_id', {
        ...foreignKey('user_id', 'users', false),
        after: 'id'
      });

      await queryInterface.addColumn('subscriptions', 'package_id', {
        ...foreignKey('package_id', 'packages', false),
        after: 'user_id'
      });

      await queryInterface.addColumn('subscriptions', 'listing_count', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        after: 'user_id'
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async () => Promise.resolve()
};
