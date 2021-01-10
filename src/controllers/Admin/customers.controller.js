import { Users, Products } from '@models';
import { Op } from 'sequelize';
import { paginate } from '@utils';

export const list = async (req, res, next) => {
  try {
    const { keyword, limit, offset } = req.query;

    const users = await Users.findAll({
      include: [{ model: Products, as: 'products' }],
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
        ]
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
