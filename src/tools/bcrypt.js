import bcrypt from 'bcrypt';
import * as Config from '@configs';

// eslint-disable-next-line import/prefer-default-export
export const hashPassword = password => {
  const salt = bcrypt.genSaltSync(Config.bcrypt.saltRounds);
  return bcrypt.hashSync(password, salt);
};

export const comparePassword = (input, password) => new Promise(resolve => bcrypt.compare(input, password, (err, isMatch) => resolve(isMatch)));
