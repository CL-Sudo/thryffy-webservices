import Followings from '@models/followings.model';
import Products from '@models/products.model';
import Users from '@models/users.model';
import { PRODUCT } from '@templates/notification.template';
import NOTIFICATION_TYPE from '@constants/notification.constant';
import MODEL_CONSTANT from '@constants/model.constant';
import { sendCloudMessage } from '@services/notification.service';
import Notifications from '@models/notifications.model';

Products.addHook('afterCreate', 'remindFollowers', async instance => {
  try {
    const operations = [];

    const followings = await Followings.findAll({
      where: { sellerId: instance.userId },
      include: [
        { model: Users, as: 'follower' },
        { model: Users, as: 'seller' }
      ]
    });

    followings.forEach(following => {
      operations.push(
        new Promise(async (resolve, reject) => {
          try {
            const notification = await Notifications.create({
              title: PRODUCT.NEW_PRODUCT_ADDED(
                following.seller.username || following.seller.fullName
              ),
              type: NOTIFICATION_TYPE.NEW_ITEM_ADDED,
              notifierId: following.follower.id,
              actorId: following.seller.id,
              notifiableId: instance.id,
              notifiableType: MODEL_CONSTANT.POLYMORPHISM.NOTIFICATIONS.PRODUCT
            });

            const data = await Notifications.findOne({ where: { id: notification.id } });

            await sendCloudMessage({
              title: PRODUCT.NEW_PRODUCT_ADDED(
                following.seller.username || following.seller.fullName
              ),
              token: following.follower.deviceToken,
              data
            });

            return resolve();
          } catch (e) {
            return reject(e);
          }
        })
      );
    });

    await Promise.all(operations);
  } catch (e) {
    throw e;
  }
});
