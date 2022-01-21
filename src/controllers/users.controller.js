import { Users } from '@models';
import { Op } from 'sequelize';
import { getCountryId } from '@utils';
import { requestValidator } from '@validators';
import * as _ from 'lodash';

export const search = async (req, res, next) => {
  try {
    requestValidator(req);

    const countryId = await getCountryId(req);

    const { keyword, limit, offset } = req.query;

    const result = await Users.scope([
      { method: ['byCountry', countryId] },
      { method: ['excludeMe', _.get(req, 'user.id', null)] }
    ]).findAndCountAll({
      where: {
        [Op.or]: [
          {
            username: {
              [Op.like]: `%${keyword}%`
            }
          },
          {
            fullName: {
              [Op.like]: `%${keyword}%`
            }
          }
        ],
        isVerified: true,
        active: true
      },
      limit: Number(limit) || null,
      offset: Number(offset) || null
    });

    return res.status(200).json({
      message: 'success',
      payload: {
        count: result.count,
        rows: result.rows
      }
    });
  } catch (e) {
    return next(e);
  }
};
