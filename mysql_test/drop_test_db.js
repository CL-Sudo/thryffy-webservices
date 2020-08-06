const mysql = require('./test_connection');

mysql.query('DROP DATABASE IF EXISTS proshare_test', () => {
  process.exit();
});
