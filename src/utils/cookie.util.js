import Cookies from 'universal-cookie';
import * as Config from '@configs';

const getCookie = (tokenName = Config.authTokenName) => req => {
  const cookies = new Cookies(req.headers.cookie);
  return cookies.get(tokenName);
};

export { getCookie };
