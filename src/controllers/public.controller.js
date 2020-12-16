import moment from 'moment';

import { Packages, SalesOrders, Subscriptions, Users } from '@models';

import Billplz from '@services/billplz.service';

import { PAYMENT_STATUS, DELIVERY_STATUS } from '@constants';
import LISTENER from '@constants/listener.constant';

import { subscriptionListner } from '@listeners/subscription.listener';

export const billplzCallback = async (req, res, next) => {
  try {
    const { orderId } = req.query;
    const { x_signature: xSignature, paid } = req.body;
    const billplz = new Billplz();

    if (billplz.verifyXSignature(xSignature, req.body)) {
      const order = await SalesOrders.findOne({ where: { id: orderId } });
      await order.update({
        paymentStatus: paid === 'true' ? PAYMENT_STATUS.SUCCESS : PAYMENT_STATUS.PENDING,
        deliveryStatus: paid === 'true' ? DELIVERY_STATUS.TO_SHIP : null
      });
    }

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    return next(e);
  }
};

export const subscribeCallback = async (req, res, next) => {
  try {
    const { userId, packageId } = req.query;
    const { x_signature: xSignature, paid } = req.body;

    const billplz = new Billplz();

    if (billplz.verifyXSignature(xSignature, req.body) && paid === 'true') {
      const currentSubscription = await Subscriptions.findOne({ where: { userId } });

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
          userId,
          expiryDate: moment()
            .add(1, 'months')
            .format('YYYY-MM-DD HH:mm:ss')
        });
      }

      const subscription = await Subscriptions.findOne({
        where: { userId },
        include: [
          { model: Users, as: 'user' },
          { model: Packages, as: 'package' }
        ]
      });
      await subscription.user.update({ hasValidSubscription: true });

      subscriptionListner.emit(LISTENER.SUBSCRIPTION.CREATED, subscription);
    }

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    return next(e);
  }
};
