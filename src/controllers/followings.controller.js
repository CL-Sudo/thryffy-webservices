import { defaultExcludeFields } from '@constants/sequelize.constant';
import { Followings, Users } from '@models';
import { paginate } from '@utils';

export const follow = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { sellerId } = req.body;

    if (id === sellerId) throw new Error('You cannot follow yourself');

    await Followings.create({ followerId: id, sellerId });
    return res.status(200).json({ message: 'success' });
  } catch (e) {
    return next(e);
  }
};

export const unfollow = async (req, res, next) => {
  try {
    const { id: sellerId } = req.params;
    const { id } = req.user;
    const followings = await Followings.findOne({ where: { sellerId, followerId: id } });
    if (!followings) throw new Error('Data not found');
    await followings.destroy({ force: true });
    return res.status(200).json({ message: 'Delete success' });
  } catch (e) {
    return next(e);
  }
};

export const listFollower = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { id } = req.params;
    const { limit, offset } = req.query;
    const users = await Users.findOne({
      where: { id },
      include: [
        {
          model: Users,
          as: 'followers',
          through: { attributes: [] },
          attributes: {
            exclude: [
              ...defaultExcludeFields,
              'location',
              'password',
              'facebookId',
              'googleId',
              'deviceToken',
              'refreshToken',
              'resetToken',
              'loginFrequency',
              'lastLogin',
              'beneficiaryName',
              'beneficiaryBank',
              'beneficiaryPhoneNo',
              'bankAccountNo'
            ]
          }
        }
      ]
    });

    await Promise.all(
      users.followers.map(async instance => {
        await instance.getExtraFields();
        await instance.checkIsFollowed(userId);
      })
    );
    return res.status(200).json({
      message: 'success',
      payload: {
        count: users.followers.length,
        rows: paginate(limit)(offset)(users.followers)
      }
    });
  } catch (e) {
    return next(e);
  }
};

export const listFollowing = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { id } = req.params;
    const { limit, offset } = req.query;
    const users = await Users.findOne({
      where: { id },
      include: [
        {
          model: Users,
          as: 'sellers',
          through: { attributes: [] },
          attributes: {
            exclude: [
              ...defaultExcludeFields,
              'password',
              'location',
              'facebookId',
              'googleId',
              'deviceToken',
              'refreshToken',
              'resetToken',
              'loginFrequency',
              'lastLogin',
              'beneficiaryName',
              'beneficiaryBank',
              'beneficiaryPhoneNo',
              'bankAccountNo'
            ]
          }
        }
      ]
    });

    await Promise.all(
      users.sellers.map(async instance => {
        await instance.getExtraFields();
        await instance.checkIsFollowed(userId);
      })
    );
    return res.status(200).json({
      message: 'success',
      payload: {
        count: users.sellers.length,
        rows: paginate(limit)(offset)(users.sellers)
      }
    });
  } catch (e) {
    return next(e);
  }
};
