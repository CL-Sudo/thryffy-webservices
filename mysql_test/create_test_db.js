const mysql = require('./test_connection');

mysql.query('CREATE DATABASE IF NOT EXISTS proshare_test', () => {
  process.exit();
});
