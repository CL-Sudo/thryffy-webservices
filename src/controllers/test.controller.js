import 'isomorphic-fetch';
import formidable from 'formidable';
import { generateJWT } from '@utils/auth.util';

export const test = async (req, res, next) => {
  const form = formidable({ multiple: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return next(err);
    try {
      const token = await generateJWT(
        {
          id: 6,
          type: 2,
          countryId: 1
        },
        '365d'
      );

      return res.status(200).json({
        message: 'test.controller.js working',
        payload: token
      });
    } catch (e) {
      return next(e);
    }
  });
};
