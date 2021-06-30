import _ from 'lodash';
import app from './app';

const nodeEnv = _.toUpper(process.env.NODE_ENV) || 'PRODUCTION';

app.listen(process.env[`${[nodeEnv]}_PORT`] || 3000, () => {
  const appName = process.env[`${[nodeEnv]}_APP_NAME`] || '';
  console.log(`${appName} APIs is running on PORT ${process.env[`${[nodeEnv]}_PORT`] || 3000}`); // eslint-disable-line no-console
});

// require('./scripts/cronjobs.script');

export default app;
