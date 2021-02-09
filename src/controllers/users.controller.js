import { Users } from '@models';

import { Op } from 'sequelize';

import { paginate } from '@utils';

import { requestValidator } from '@validators';

export const search = async (req, res, next) => {
  try {
    requestValidator(req);

    const { keyword, limit, offset } = req.query;

    const users = await Users.findAll({
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
        isVerified: true
      }
    });

    return res.status(200).json({
      message: 'success',
      payload: {
        count: users.length,
        rows: paginate(limit)(offset)(users)
      }
    });
  } catch (e) {
    return next(e);
  }
};
