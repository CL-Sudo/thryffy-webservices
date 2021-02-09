module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('users', 'beneficiary_name', {
        type: Sequelize.STRING(100),
        after: 'has_valid_subscription'
      });
      await queryInterface.addColumn('users', 'beneficiary_bank', {
        type: Sequelize.STRING(50),
        after: 'beneficiary_name'
      });
      await queryInterface.addColumn('users', 'beneficiary_phone_no', {
        type: Sequelize.STRING(30),
        after: 'beneficiary_bank'
      });
      await queryInterface.addColumn('users', 'bank_account_no', {
        type: Sequelize.STRING(50),
        after: 'beneficiary_phone_no'
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async () => Promise.resolve()
};
