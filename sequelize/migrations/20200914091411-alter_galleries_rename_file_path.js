module.exports = {
  up: queryInterface => queryInterface.renameColumn('galleries', 'filePath', 'file_path'),

  down: () => Promise.resolve()
};
