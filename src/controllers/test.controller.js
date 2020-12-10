import { Notifications } from '@models';
import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';

export const test = async (req, res, next) => {
  try {
    await sequelize.transaction(async transaction => {
      const notification = await Notifications.create(
        { type: 'test', notifiableId: 43, notifiableType: 'SALE ORDER' },
        { transaction }
      );
      const payload = await Notifications.findOne({ where: { id: notification.id }, transaction });
      console.log('payload', payload);
      throw new Error('');
    });
    return res.status(404).json({
      message: 'not found',
      payload: {}
    });
  } catch (e) {
    console.log('e', e);
    return next(e);
  }
};
