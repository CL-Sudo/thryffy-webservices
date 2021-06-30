module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('galleries', 'index', {
      type: Sequelize.TINYINT,
      after: 'file_path'
    }),

  down: queryInterface => queryInterface.removeColumn('galleries', 'index')
};
