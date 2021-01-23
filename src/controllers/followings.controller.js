import { defaultExcludeFields } from '@constants/sequelize.constant';
import { Followings, Users } from '@models';

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
    const { sellerId } = req.params;
    const { id } = req.user;
    const followings = await Followings.findOne({ where: { sellerId, followerId: id } });
    if (!followings) throw new Error('Data not found');
    await followings.destroy({ force: true });
    return res.status(200).json({ message: 'Delete success' });
  } catch (e) {
    return next(e);
  }
};

export const list = async (req, res, next) => {
  try {
    const { id } = req.params;
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
              'facebookId',
              'googleId',
              'deviceToken',
              'otp',
              'otpValidity',
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
    return res.status(200).json({ message: 'success', payload: users.followers });
  } catch (e) {
    return next(e);
  }
};
