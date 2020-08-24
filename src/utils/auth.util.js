import jwt from 'jsonwebtoken';
import randtoken from 'rand-token';
import * as Config from '@configs';
import { v4 as uuidv4 } from 'uuid';
import R from 'ramda';
import { Users } from '@models';
import { Op } from 'sequelize';

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

export const generateOTP = () => randtoken.generate(4, '123456789');

export const generateResetToken = async email =>
  new Promise(async (resolve, reject) => {
    try {
      const jwtToken = jwt.sign(
        {
          email
        },
        Config.jwt.secret,
        {
          expiresIn: '1d'
        }
      );
      return resolve(jwtToken);
    } catch (e) {
      return reject(e);
    }
  });

export const generateUsername = async (proposedName, generatedName) =>
  new Promise(async (resolve, reject) => {
    try {
      const normalizedUsername = R.replace(/ /g, '.')(R.toLower(proposedName));
      const user = await Users.findOne({
        raw: true,
        where: {
          username: {
            [Op.like]: `%${generatedName || normalizedUsername}%`
          }
        }
      });

      if (user) {
        const generated = `${normalizedUsername}.${uuidv4()}`;
        return resolve(await generateUsername(normalizedUsername, generated));
      }

      return resolve(generatedName || normalizedUsername);
    } catch (e) {
      return reject(e);
    }
  });

export const parseFirstNameLastName = fullName => {
  const splited = R.split(' ')(R.trim(fullName));
  if (R.length(splited) > 1) {
    return {
      firstName: splited[0],
      lastName: R.last(splited)
    };
  }
  return {
    firstName: null,
    lastName: splited[0]
  };
};
