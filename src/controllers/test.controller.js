import R from 'ramda';
import { Users } from '@models';

export const test = async (req, res, next) => {
  try {
    await Users.create({
      email: 'lcl24680gmail.com'
    });

    return res.status(200).json({
      message: 'success'
    });
  } catch (e) {
    return next(e);
  }
};
