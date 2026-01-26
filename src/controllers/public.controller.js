import _ from 'lodash';
import R from 'ramda';

import {
  Packages,
  SalesOrders,
  Subscriptions,
  Users,
  OrderItems,
  Products,
  Notifications,
  DeliveryStatuses
} from '@models';

import Billplz from '@services/billplz.service';
import { vertifySignature } from '@services/trackingmore.service';

import { PAYMENT_STATUS, DELIVERY_STATUS, PAYMENT_METHOD } from '@constants';
import LISTENER from '@constants/listener.constant';
import NOTIFICATION_TYPE from '@constants/notification.constant';
import NOTIFIABLE_TYPE from '@constants/model.constant';

import { subscriptionListner } from '@listeners/subscription.listener';

import { SequelizeConnector as sequelize } from '@configs/sequelize-connector.config';

import { cartListener } from '@listeners/cart.listener';

import { sendCloudMessage } from '@services/notification.service';

import { DELIVERY } from '@templates/notification.template';

const BEEPPAY_PAYMENT_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failure'
};

const parsePayBeepReqeustQuery = requestQuery => {
  const trasactionObj = JSON.parse(
    _.chain(requestQuery)
      .omit(['Type', 'order_id'])
      .map((o, k) => k + o)
      .take()
      .value()
  );

  const arr = _.split(requestQuery.order_id, '-');

  const obj = { userId: null, packageId: null, orderId: null };

  _.forEach(arr, ins => {
    if (_.includes(ins, 'u')) {
      _.merge(obj, { userId: _.toInteger(_.replace(ins, 'u', '')) });
    }

    if (_.includes(ins, 'p')) {
      _.merge(obj, { packageId: _.toInteger(_.replace(ins, 'p', '')) });
    }

    if (_.includes(ins, 'o')) {
      _.merge(obj, { orderId: _.toInteger(_.replace(ins, 'o', '')) });
    }
  });

  // console.log(`obj`, obj);

  return {
    Type: requestQuery.Type,
    orderId: obj.orderId,
    packageId: obj.packageId,
    userId: obj.userId,
    ...trasactionObj
  };
};

export const onSuccessSubscribing = async (userId, packageId) =>
  sequelize.transaction(async trasaction => {
    const currentSubscription = await Subscriptions.findOne({ where: { userId }, trasaction });

    if (currentSubscription) {
      await currentSubscription.update(
        {
          packageId
        },
        { trasaction }
      );
    } else {
      await Subscriptions.create(
        {
          packageId,
          userId
        },
        { trasaction }
      );
    }

    const subscription = await Subscriptions.findOne({
      trasaction,
      where: { userId },
      include: [
        { model: Users, as: 'user' },
        { model: Packages, as: 'package' }
      ]
    });

    subscriptionListner.emit(LISTENER.SUBSCRIPTION.CREATED, subscription);

    return subscription;
  });

export const onPaymentForItemSuccess = async (orderId, transactionId, paymentMethod = null) =>
  sequelize.transaction(async transaction => {
    const now = new Date();
    const order = await SalesOrders.scope({
      method: ['orderDetails', orderId]
    }).findOne({ where: { id: orderId }, transaction });

    await order.update(
      {
        paymentStatus: PAYMENT_STATUS.SUCCESS,
        deliveryStatus: DELIVERY_STATUS.TO_SHIP,
        transactionId,
        paidAt: now,
        paymentMethod: paymentMethod || PAYMENT_METHOD.ONLINE_BANKING
      },
      { transaction }
    );

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
      orderItems.map(instance =>
        instance.product.update({ isPurchased: true, soldAt: now }, transaction)
      )
    );

    const { seller } = order.orderItems[0].product;
    const payload = R.assoc('seller', seller)(order.dataValues);

    cartListener.emit(LISTENER.CART.PAYMENT_MADE, productIds, payload);
  });

const onPaymentForItemFailed = async orderId =>
  sequelize.transaction(async transaction => {
    const order = await SalesOrders.scope({
      method: ['orderDetails', orderId]
    }).findOne({ where: { id: orderId }, transaction });

    await order.update(
      {
        paymentStatus: PAYMENT_STATUS.FAILED
      },
      { transaction }
    );

    cartListener.emit(LISTENER.CART.PAYMENT_NOT_MADE, orderId);
  });

export const billplzCallback = async (req, res, next) => {
  try {
    const { orderId } = req.query;
    const { x_signature: xSignature, paid, transaction_id: transactionId } = req.body;
    const now = new Date();
    const billplz = new Billplz();

    if (billplz.verifyXSignature(xSignature, req.body)) {
      await sequelize.transaction(async transaction => {
        const order = await SalesOrders.scope({
          method: ['orderDetails', orderId]
        }).findOne({ where: { id: orderId }, transaction });
        await order.update(
          {
            paymentStatus: paid === 'true' ? PAYMENT_STATUS.SUCCESS : PAYMENT_STATUS.FAILED,
            deliveryStatus: paid === 'true' ? DELIVERY_STATUS.TO_SHIP : null,
            transactionId: paid === 'true' ? transactionId : null,
            paidAt: paid === 'true' ? new Date() : null,
            paymentMethod: paid === 'true' ? PAYMENT_METHOD.ONLINE_BANKING : null
          },
          { transaction }
        );

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

        if (paid === 'true') {
          const productIds = orderItems.map(instance => instance.product.id);

          await Promise.all(
            orderItems.map(instance =>
              instance.product.update({ isPurchased: true, soldAt: now }, transaction)
            )
          );

          const { seller } = order.orderItems[0].product;
          const payload = R.assoc('seller', seller)(order.dataValues);

          cartListener.emit(LISTENER.CART.PAYMENT_MADE, productIds, payload);
        } else {
          cartListener.emit(LISTENER.CART.PAYMENT_NOT_MADE, orderId);
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
        setTimeout(resolve, 5000);
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
        setTimeout(resolve, 5000);
      });

    await wait();

    const subscription = await Subscriptions.findOne({
      where: { userId },
      include: [{ model: Packages, as: 'package' }]
    });

    const payload = R.isNil(subscription)
      ? { paymentStatus: PAYMENT_STATUS.FAILED }
      : { paymentStatus: PAYMENT_STATUS.SUCCESS, ...subscription.dataValues };

    return res.status(200).send(`
      <script>
        window.ReactNativeWebView.postMessage(
          ${JSON.stringify(
            JSON.stringify({
              status: true,
              payload
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
          packageId
        });
      } else {
        await Subscriptions.create({
          packageId,
          userId
        });
      }

      const subscription = await Subscriptions.findOne({
        where: { userId },
        include: [
          { model: Users, as: 'user' },
          { model: Packages, as: 'package' }
        ]
      });

      subscriptionListner.emit(LISTENER.SUBSCRIPTION.CREATED, subscription);
    }
    return res.status(200).json({ message: 'success' });
  } catch (e) {
    return next(e);
  }
};

export const trackingMoreWebHook = async (req, res, next) => {
  // eslint-disable-next-line no-console
  console.log(`\n...Trackingmore Webhook Running...\n`);
  try {
    const { tracking_number: deliveryTrackingNo, status } = req.body.data;
    const { trackinfo } = req.body.data.origin_info;
    const { timeStr, signature } = req.body.verifyInfo;

    const isSignatureValid = await vertifySignature(timeStr, signature);

    if (isSignatureValid) {
      await sequelize.transaction(async transaction => {
        const order = await SalesOrders.findOne({
          where: { deliveryTrackingNo },
          include: [
            { model: Users, as: 'seller' },
            { model: Users, as: 'buyer' },
            { model: OrderItems, as: 'orderItems', include: [{ model: Products, as: 'product' }] },
            { model: DeliveryStatuses, as: 'trackingmore' }
          ],
          transaction
        });

        await order.trackingmore.update(
          { trackingmorePayload: JSON.stringify(req.body.data) },
          { transaction }
        );

        if (
          R.toUpper(status) === 'DELIVERED' &&
          R.toUpper(trackinfo[0].checkpoint_status) === 'DELIVERED'
        ) {
          await order.update({ deliveryStatus: DELIVERY_STATUS.DELIVERED }, { transaction });

          const notification = await Notifications.create(
            {
              title: DELIVERY.COMPLETED(order.orderRef),
              actorId: order.sellerId,
              notifierId: order.userId,
              type: NOTIFICATION_TYPE.DELIVERY_COMPLETED,
              notifiableId: order.id,
              notifiableType: NOTIFIABLE_TYPE.POLYMORPHISM.NOTIFICATIONS.SALE_ORDER
            },
            { transaction }
          );
          const data = await Notifications.findOne({ where: { id: notification.id }, transaction });

          await sendCloudMessage({
            title: DELIVERY.COMPLETED(order.orderRef),
            token: order.buyer.deviceToken,
            data
          });

          const sellerNotification = await Notifications.create(
            {
              title: 'Your buyer has just received the parcel!',
              type: NOTIFICATION_TYPE.DELIVERY_COMPLETED,
              actorId: order.buyer.id,
              notifierId: order.seller.id,
              notifiableType: NOTIFIABLE_TYPE.POLYMORPHISM.NOTIFICATIONS.SALE_ORDER,
              notifiableId: order.id
            },
            { transaction }
          );

          const sellerNotificationData = await Notifications.findOne({
            where: { id: sellerNotification.id },
            transaction
          });

          await sendCloudMessage({
            title: DELIVERY.COMPLETED(order.orderRef),
            token: order.seller.deviceToken,
            data: sellerNotificationData
          });
        }
      });
    }

    // eslint-disable-next-line no-console
    console.log(`\n***Trackingmore Webhook Done***\n`);

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(`\n!!!Trackingmore Webhook ERROR!!!\n`);
    return next(e);
  }
};

export const senangpayCallback = async (req, res, next) => {
  try {
    const transactionId = _.get(req, 'body.transaction_id', req.query.transaction_id);
    const email = _.get(req, 'body.email', req.query.email);
    let status = req.body.status || req.query.status;
    const amount = req.body.amount || req.query.amount;

    if (status === 1 || status === '1') status = true;
    if (status === 0 || status === '0') status = false;

    const billplz = new Billplz();
    const billId = await billplz.getBillByTransactionId(transactionId, email, amount);

    const orderByBillId = await SalesOrders.findOne({ where: { billId } });

    await sequelize.transaction(async transaction => {
      // For mechandise
      if (orderByBillId) {
        const order = await SalesOrders.scope({
          method: ['orderDetails', orderByBillId.id]
        }).findOne({ transaction });

        await order.update(
          {
            paymentStatus: status ? PAYMENT_STATUS.SUCCESS : PAYMENT_STATUS.FAILED,
            deliveryStatus: status ? DELIVERY_STATUS.TO_SHIP : null,
            transactionId: status ? transactionId : null,
            paidAt: status ? new Date() : null,
            paymentMethod: status ? PAYMENT_METHOD.CREDIT_DEBIT_CARD : null
          },
          { transaction }
        );

        const orderItems = await OrderItems.findAll({
          where: { salesOrderId: orderByBillId.id },
          include: [
            {
              model: Products,
              as: 'product'
            }
          ],
          transaction
        });

        if (status) {
          const productIds = orderItems.map(instance => instance.product.id);

          await Promise.all(
            orderItems.map(async instance => {
              await instance.product.update({ isPurchased: true, soldAt: new Date() }, transaction);
            })
          );

          const { seller } = order.orderItems[0].product;
          const payload = R.assoc('seller', seller)(order.dataValues);

          cartListener.emit(LISTENER.CART.PAYMENT_MADE, productIds, payload);
        } else {
          cartListener.emit(LISTENER.CART.PAYMENT_NOT_MADE, orderByBillId.id);
        }
      }

      // For subscription
      if (!orderByBillId && status) {
        const { id: userId } = await Users.findOne({ where: { email } });
        const { id: packageId } = await Packages.findOne({ where: { price: amount } });
        const currentSubscription = await Subscriptions.findOne({ where: { userId } });

        if (currentSubscription) {
          await currentSubscription.update({
            packageId
          });
        } else {
          await Subscriptions.create({
            packageId,
            userId
          });
        }

        const subscription = await Subscriptions.findOne({
          where: { userId },
          include: [
            { model: Users, as: 'user' },
            { model: Packages, as: 'package' }
          ]
        });

        subscriptionListner.emit(LISTENER.SUBSCRIPTION.CREATED, subscription);
      }
    });

    return res.send('OK');
    // return res.status(200).json({ message: 'success' });
  } catch (e) {
    return next(e);
  }
};

export const senangpayRedirect = async (req, res) => {
  try {
    const transactionId = _.get(req, 'body.transaction_id', req.query.transaction_id);
    const email = _.get(req, 'body.email', req.query.email);
    const amount = req.body.amount || req.query.amount;
    const { message } = req.query;

    const isPaymentSuccessful = message === 'Payment_was_successful';

    const billplz = new Billplz();
    const billId = await billplz.getBillByTransactionId(transactionId, email, amount);

    const orderByBillId = await SalesOrders.findOne({ where: { billId } });
    let payload;
    const wait = () =>
      new Promise(async resolve => {
        setTimeout(resolve, 10000);
      });

    if (orderByBillId) {
      await wait();

      payload = await SalesOrders.scope({ method: ['orderDetails', orderByBillId.id] }).findOne();

      if (isPaymentSuccessful) {
        await payload.update({ paymentStatus: PAYMENT_STATUS.SUCCESS });
      }
    }

    if (!orderByBillId) {
      const { id: userId } = await Users.findOne({ where: { email } });

      await wait();

      const subscription = await Subscriptions.findOne({
        where: { userId },
        include: [{ model: Packages, as: 'package' }]
      });

      payload = isPaymentSuccessful
        ? { paymentStatus: PAYMENT_STATUS.SUCCESS, ...subscription.dataValues }
        : { paymentStatus: PAYMENT_STATUS.FAILED };
    }

    return res.status(200).send(`
      <script>
        window.ReactNativeWebView.postMessage(
          ${JSON.stringify(
            JSON.stringify({
              status: true,
              payload
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

export const beepPayRedirect = async (req, res) => {
  try {
    // console.log(`req.query`, req.query);
    // console.log(`req.query.order_id`, req.query.order_id);

    const {
      Type: paymentStatus,
      orderId = null,
      packageId = null,
      userId = null,
      transaction,
      sourceOfFunds
    } = parsePayBeepReqeustQuery(req.query);

    // console.log(`orderId`, orderId);

    // console.log(`paymentStatus`, paymentStatus);
    // console.log(`transaction`, transaction);
    // console.log(`sourceOfFunds`, sourceOfFunds);
    // console.log(`orderId`, orderId);
    // console.log(`packageId`, packageId);
    // console.log(`userId`, userId);
    // console.log(`transactionId`, _.get(transaction, 'acquirer.transactionId', ''));
    // console.log(`fundingMethod`, _.get(sourceOfFunds, 'provided.card.fundingMethod', ''));

    // For Merchandises
    if (orderId) {
      if (paymentStatus === BEEPPAY_PAYMENT_STATUS.SUCCESS) {
        await onPaymentForItemSuccess(
          orderId,
          _.get(transaction, 'acquirer.transactionId', ''),
          _.get(sourceOfFunds, 'provided.card.fundingMethod', '')
        );

        const order = await SalesOrders.scope({ method: ['orderDetails', orderId] }).findOne();

        return res.status(200).send(`
        <script>
          window.ReactNativeWebView.postMessage(
            ${JSON.stringify(
              JSON.stringify({
                status: true,
                payload: order.get()
              })
            )}
          );
        </script>
      `);
      }

      if (paymentStatus === BEEPPAY_PAYMENT_STATUS.FAILED) {
        await onPaymentForItemFailed(orderId);

        const order = await SalesOrders.scope({ method: ['orderDetails', orderId] }).findOne();

        return res.status(200).send(`
        <script>
          window.ReactNativeWebView.postMessage(
            ${JSON.stringify(JSON.stringify({ status: false, payload: order.get() }))}
          );
        </script>
      `);
      }
    }

    // For Subscription
    if (packageId) {
      if (paymentStatus === BEEPPAY_PAYMENT_STATUS.SUCCESS) {
        await onSuccessSubscribing(userId, packageId);

        const subscription = await Subscriptions.findOne({
          where: { userId },
          include: [{ model: Packages, as: 'package' }]
        });

        const payload = { paymentStatus: PAYMENT_STATUS.SUCCESS, ...subscription.get() };

        return res.status(200).send(`
          <script>
            window.ReactNativeWebView.postMessage(
              ${JSON.stringify(
                JSON.stringify({
                  status: true,
                  payload
                })
              )}
            );
          </script>
        `);
      }

      if (paymentStatus === BEEPPAY_PAYMENT_STATUS.FAILED) {
        const payload = { paymentStatus: PAYMENT_STATUS.FAILED };

        return res.status(200).send(`
          <script>
            window.ReactNativeWebView.postMessage(
              ${JSON.stringify(
                JSON.stringify({
                  status: true,
                  payload
                })
              )}
            );
          </script>
        `);
      }
    }
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
