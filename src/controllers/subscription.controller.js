import { Subscriptions, Packages, Users } from '@models';
import { requestValidator } from '@validators';

import { subscriptionListner } from '@listeners/subscription.listener';

import LISTENER from '@constants/listener.constant';

import moment from 'moment';

export const subscribe = async (req, res, next) => {
  try {
    requestValidator(req);

    const { id } = req.user;
    const { packageId } = req.body;

    const currentSubscription = await Subscriptions.findOne({ where: { userId: id } });

    if (currentSubscription) {
      await currentSubscription.update({
        packageId,
        expiryDate: moment()
          .add(1, 'months')
          .format('YYYY-MM-DD HH:mm:ss')
      });
    } else {
      await Subscriptions.create({
        packageId,
        userId: id,
        expiryDate: moment()
          .add(1, 'months')
          .format('YYYY-MM-DD HH:mm:ss')
      });
    }

    const payload = await Subscriptions.findOne({
      where: { userId: id },
      include: [
        {
          model: Packages,
          as: 'package'
        },
        {
          model: Users,
          as: 'user'
        }
      ]
    });

    const hasValidSubscription = await payload.checkHasValidSubscription();
    await payload.update({ hasValidSubscription });

    subscriptionListner.emit(LISTENER.SUBSCRIPTION.CREATED, payload);

    delete payload.user;
    delete payload.dataValues.user;

    return res.status(200).json({ message: 'success', payload });
  } catch (e) {
    return next(e);
  }
};

export const get = async (req, res, next) => {
  try {
    const { id } = req.user;
    const subscription = await Subscriptions.findOne({
      where: { userId: id },
      include: [
        {
          model: Packages,
          as: 'package'
        }
      ]
    });
    return res.status(200).json({ message: 'success', payload: subscription });
  } catch (e) {
    return next(e);
  }
};
