/* eslint-disable */
const Sequelize = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();
/* eslint-enable */

module.exports = {
  development: {
    username: process.env.DEV_DB_USER,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOST,
    dialect: process.env.DEV_DB_DRIVER,
    operatorsAliases: Sequelize.Op
  },
  DEV: {
    username: process.env.DEV_DB_USER,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOST,
    dialect: process.env.DEV_DB_DRIVER,
    operatorsAliases: Sequelize.Op
  },
  dev: {
    username: process.env.DEV_DB_USER,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOST,
    dialect: process.env.DEV_DB_DRIVER,
    operatorsAliases: Sequelize.Op
  },
  test: {
    username: process.env.TEST_DB_USER,
    password: process.env.TEST_DB_PASSWORD,
    database: process.env.TEST_DB_NAME,
    host: process.env.TEST_DB_HOST,
    dialect: process.env.TEST_DB_DRIVER,
    operatorsAliases: Sequelize.Op
  },
  production: {
    username: process.env.PRODUCTION_DB_USER,
    password: process.env.PRODUCTION_DB_PASSWORD,
    database: process.env.PRODUCTION_DB_NAME,
    host: process.env.PRODUCTION_DB_HOST,
    dialect: process.env.PRODUCTION_DB_DRIVER,
    operatorsAliases: Sequelize.Op
  },
  staging: {
    username: process.env.STAGING_DB_USER,
    password: process.env.STAGING_DB_PASSWORD,
    database: process.env.STAGING_DB_NAME,
    host: process.env.STAGING_DB_HOST,
    dialect: process.env.STAGING_DB_DRIVER,
    operatorsAliases: Sequelize.Op
  }
};
