module.exports = {
  up: async queryInterface => {
    try {
      await queryInterface.addConstraint('followings', {
        type: 'unique',
        fields: ['seller_id', 'follower_id']
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: () => Promise.resolve()
};
