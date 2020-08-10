import jwt from 'jsonwebtoken';
import randtoken from 'rand-token';
import * as Config from '@configs';

export const generateRefreshToken = () => randtoken.uid(255);

export const generateJWT = data =>
  new Promise(async (resolve, reject) => {
    try {
      const jwtToken = jwt.sign(
        {
          authData: data
        },
        Config.jwt.secret,
        {
          expiresIn: Config.jwt.expiresIn
        }
      );
      return resolve(jwtToken);
    } catch (e) {
      return reject(e);
    }
  });
