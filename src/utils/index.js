import Countries from '@models/countries.model';
import geoip from 'geoip-lite';

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

  if (req.ip === '::1') {
    const country = await Countries.findOne({ where: { code: 'MY' } });
    return country.id || null;
  }

  const ipInfo = geoip.lookup(req.ip || '115.132.161.236');

  return Countries.findOne({ where: { code: ipInfo.country } }).then(
    result => result.get('id') || null
  );
};
