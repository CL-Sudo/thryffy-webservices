// eslint-disable-next-line import/no-extraneous-dependencies
const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.TEST_DB_HOST,
  user: process.env.TEST_DB_USER,
  password: process.env.TEST_DB_PASSWORD
});

connection.connect(err => {
  if (err) throw err;
});

module.exports = connection;
