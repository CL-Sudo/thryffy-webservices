module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('sales_orders', 'has_buyer_dispute', {
        type: Sequelize.BOOLEAN,
        after: 'commission_paid_at',
        defaultValue: false
      });
      await queryInterface.addColumn('sales_orders', 'has_seller_dispute', {
        type: Sequelize.BOOLEAN,
        after: 'has_buyer_dispute',
        defaultValue: false
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: () => Promise.resolve()
};
