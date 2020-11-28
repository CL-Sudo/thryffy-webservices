import R from 'ramda';
import { Preferences } from '@models';
export const test = async (req, res, next) => {
  try {
    const result = await Preferences.findAll({});

    return res.status(404).json({
      message: 'not found'
    });
  } catch (e) {
    console.log('e', e);
    return next(e);
  }
};
