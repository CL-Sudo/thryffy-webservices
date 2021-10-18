import { Countries } from '@models';
// import geoip from 'geoip-lite';
// import * as _ from 'lodash';

export * from './utils';
export * from './auth.util';
export * from './discover.util';
export * from './product.utils';

export const isJSON = param => {
  try {
    JSON.parse(param);
    return true;
  } catch (e) {
    return false;
  }
};

export const getCountryId = async req => {
  if (req.user) {
    return req.user.countryId;
  }

  const country = await Countries.findOne({ where: { code: req.query.countryCode || '' } });

  if (!country) {
    throw new Error('Invalid countryCode given.');
  }

  return country.id;

  // if (req.ip === '::1' || _.includes(req.ip, '::ffff')) {
  //   const country = await Countries.findOne({ where: { code: 'MY' } });
  //   return country.id || null;
  // }

  // const ipInfo = geoip.lookup(req.ip || '115.132.161.236');

  // return Countries.findOne({ where: { code: ipInfo.country } }).then(
  //   result => result.get('id') || null
  // );
};
