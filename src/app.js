import dotenv from 'dotenv';
import _ from 'lodash';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import expressValidator from 'express-validator';
// import { validationResult } from 'express-validator/check';
import PrettyError from 'pretty-error';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { cyanStyle } from './styles/error.style';
// import https from 'https';
// import http from 'http';
// import fs from 'fs';

/* eslint-enable */

dotenv.config();

require('./tools/passport');
require('./scripts');
require('./scripts/cronjobs.script');
// require('./utils/scheduler');

const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');
pe.appendStyle(cyanStyle);

// var renderedError = pe.render(new Error('Some error message'));

// process.on('unhandledRejection', (reason, p) => {
// console.error('Unhandled Rejection at:', p, 'reason:', reason); // eslint-disable-line no-console
// });

const app = express();

// const eventEmitter = new events.EventEmitter();

app.set('view engine', 'html');

app.use(bodyParser.json({ limit: '20mb', type: 'application/json' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }));
app.use(morgan('dev'));
app.use(helmet());

app.use(
  expressValidator({
    errorFormatter: (param, msg, value, location) => `${param}: ${msg}` // eslint-disable-line
  })
);

app.use(cookieParser());

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, x-access-token');
//   next();
// });

app.use(
  cors({
    credentials: true,
    origin: true,
    exposedHeaders: 'Content-Disposition'
  })
);

app.set('trust proxy', 1);

app.all('/*', (req, res, next) => next());
app.put('/*', (req, res, next) => next());

app.use(compression());

routes(app);

// Error Message Handler
app.use((err, req, res, next) => {
  if (_.includes(err.message, 'Validation failed')) {
    return res.status(400).send(_.join(err.array(), '\n'));
  }
  if (err.name === 'ValidationError') {
    // eslint-disable-next-line no-param-reassign
    err.status = 400;
  }
  if (process.env.NODE_ENV !== 'TEST') {
    // eslint-disable-next-line no-console
    console.error(pe.render(err));
  }

  res.status(err.status || 500);
  if (_.has(err, 'message')) {
    res.send(err.message);
  } else {
    let errorMessage = err;
    if (_.isArray(errorMessage)) {
      errorMessage = _.join(errorMessage, '\n');
    } else if (!_.isString(errorMessage)) {
      errorMessage = JSON.stringify(errorMessage);
    }

    res.send(errorMessage);
    // res.send(_.isString(err) ? err : JSON.stringify(err));
  }
  return next();
});

export default app;
