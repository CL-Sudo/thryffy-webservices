import { Commissions } from '@models';

module.exports = {
  up: async () => {
    try {
      const commissions = await Commissions.findAll();

      const operations = [];

      commissions.forEach(instance => {
        if (instance.maxPrice > 20) {
          operations.push(
            new Promise(async (resolve, reject) => {
              try {
                await instance.update({ commissionRate: 0.15 });
                return resolve();
              } catch (e) {
                return reject(e);
              }
            })
          );
        }
      });

      await Promise.all(operations);

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async () => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return Promise.resolve();
  }
};
