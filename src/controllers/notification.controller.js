import { Notifications, Users } from '@models';
import { defaultExcludeFields } from '@constants/sequelize.constant';

export const get = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const { id } = req.user;

    const notifications = await Notifications.findAndCountAll({
      where: { notifierId: id },
      include: [{ model: Users, as: 'actor', attributes: { exclude: [...defaultExcludeFields] } }],
      limit: Number(limit) || null,
      offset: Number(offset) || null
    });

    return res.status(200).json({ message: 'success', payload: notifications });
  } catch (e) {
    return next(e);
  }
};
