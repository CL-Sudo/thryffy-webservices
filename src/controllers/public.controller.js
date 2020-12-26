import moment from 'moment';
import R from 'ramda';

import { Packages, SalesOrders, Subscriptions, Users, OrderItems, Products } from '@models';

import Billplz from '@services/billplz.service';

import { PAYMENT_STATUS, DELIVERY_STATUS } from '@constants';
import LISTENER from '@constants/listener.constant';

import { subscriptionListner } from '@listeners/subscription.listener';

import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';

import { cartListener } from '@listeners/cart.listener';

export const billplzCallback = async (req, res, next) => {
  try {
    const { orderId } = req.query;
    const { x_signature: xSignature, paid } = req.body;
    const billplz = new Billplz();

    if (billplz.verifyXSignature(xSignature, req.body)) {
      await sequelize.transaction(async transaction => {
        const order = await SalesOrders.scope({
          method: ['orderDetails', orderId]
        }).findOne({ where: { id: orderId }, transaction });
        await order.update(
          {
            paymentStatus: paid === 'true' ? PAYMENT_STATUS.SUCCESS : PAYMENT_STATUS.FAILED,
            deliveryStatus: paid === 'true' ? DELIVERY_STATUS.TO_SHIP : null
          },
          { transaction }
        );

        if (paid === 'true') {
          const orderItems = await OrderItems.findAll({
            where: { salesOrderId: orderId },
            include: [
              {
                model: Products,
                as: 'product'
              }
            ],
            transaction
          });

          const productIds = orderItems.map(instance => instance.product.id);

          await Promise.all(
            orderItems.map(async instance => {
              await instance.product.update({ isPurchased: true }, transaction);
            })
          );

          const { seller } = order.orderItems[0].product;
          const payload = R.assoc('seller', seller)(order.dataValues);

          cartListener.emit(LISTENER.CART.PAYMENT_MADE, productIds, payload);
        }
      });
    }

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    return next(e);
  }
};

export const billplzRedirect = async (req, res) => {
  try {
    const { orderId } = req.query;

    const wait = () =>
      new Promise(async resolve => {
        setTimeout(resolve, 4000);
      });

    await wait();

    const order = await SalesOrders.scope({ method: ['orderDetails', orderId] }).findOne();

    return res.status(200).send(`
      <script>
        window.ReactNativeWebView.postMessage(
          ${JSON.stringify(
            JSON.stringify({
              status: true,
              payload: order
            })
          )}
        );
      </script>
    `);
  } catch (e) {
    return res.status(200).send(`
      <script>
        window.ReactNativeWebView.postMessage(
          ${JSON.stringify(JSON.stringify({ status: false, message: e.message }))}
        );
      </script>
    `);
  }
};

export const subscriptionRedirect = async (req, res) => {
  try {
    const { userId } = req.query;

    const wait = () =>
      new Promise(async resolve => {
        setTimeout(resolve, 4000);
      });

    await wait();

    const subscription = await Subscriptions.findOne({
      where: { userId },
      include: [{ model: Packages, as: 'package' }]
    });

    return res.status(200).send(`
      <script>
        window.ReactNativeWebView.postMessage(
          ${JSON.stringify(
            JSON.stringify({
              status: true,
              payload: subscription
            })
          )}
        );
      </script>
    `);
  } catch (e) {
    return res.status(200).send(`
      <script>
        window.ReactNativeWebView.postMessage(
          ${JSON.stringify(JSON.stringify({ status: false, message: e.message }))}
        );
      </script>
    `);
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
