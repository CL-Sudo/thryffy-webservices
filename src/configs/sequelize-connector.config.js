import Sequelize from 'sequelize';
import Dotenv from 'dotenv';
import _ from 'lodash';

Dotenv.config();

const nodeEnv = _.toUpper(process.env.NODE_ENV) || 'DEV';

console.log(`*******************************`);
console.log(`      NODE_ENV %s`, nodeEnv);
console.log(`*******************************`);

const SequelizeConnector = new Sequelize(
  process.env[`${[nodeEnv]}_DB_NAME`] || '',
  process.env[`${[nodeEnv]}_DB_USER`],
  process.env[`${[nodeEnv]}_DB_PASSWORD`],
  {
    host: process.env[`${[nodeEnv]}_DB_HOST`] || 'localhost',
    dialect: process.env[`${[nodeEnv]}_DB_DRIVER`] || 'mysql',
    operatorsAliases: '1',
    pool: {
      max: 30,
      min: 0,
      acquire: 60000,
      idle: 10000
    },
    define: {
      paranoid: true,
      timestamps: true,
      freezeTableName: true,
      underscored: true
    },
    dialectOptions: {
      decimalNumbers: true
    },
    logging: false
  }
);

const db = SequelizeConnector;

export { Sequelize, SequelizeConnector, db };
